import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseUnits } from "viem";
import Button from "../common/Button";
import { submitDonation, confirmCryptoDonation } from "../../api/projectApi";
import { approveUsdtMock, donateToVault } from "../../hook/contract/vault";
import "./DonateModal.css";

const QUICK_AMOUNTS_USD = [5, 10, 20, 50, 100];
const PAYMENT_METHODS = ["VNPay", "Crypto"];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

const DonateModal = ({ project, onClose }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [stepText, setStepText] = useState("");
  const [bankingPreview, setBankingPreview] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    payment: "VNPay",
  });

  const storedUser = getStoredUser();
  const linkedWallet = storedUser?.linked_wallet || "";
  const hasLinkedWallet = Boolean(linkedWallet);
  const isCrypto = form.payment === "Crypto";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const setField = (key, value) => {
    setApiError("");
    if (key === "amount" || key === "payment") {
      setBankingPreview(null);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitLabel = useMemo(() => {
    if (loading) return stepText || "Processing...";
    if (isCrypto) {
      return form.amount
        ? `Donate $${Number(form.amount).toLocaleString()}`
        : "Donate with Crypto";
    }
    return form.amount
      ? `Pay $${Number(form.amount).toLocaleString()}`
      : "Pay with VNPay";
  }, [loading, stepText, isCrypto, form.amount]);

  const handleGoToProfile = () => {
    onClose?.();
    navigate("/profile");
  };

  const validate = () => {
    if (!project?.id) return "Project ID is missing";
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than 0";
    }
    if (isCrypto && !hasLinkedWallet) {
      return "Please link your wallet in Profile before donating with crypto";
    }
    return "";
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      setApiError(error);
      return;
    }

    setLoading(true);
    setApiError("");
    setStepText("");

    try {
      const donationType = isCrypto ? "CRYPTO" : "BANKING";

      setStepText("Creating donation...");
      const createRes = await submitDonation(project.id, {
        amount: Number(form.amount),
        donationType,
        donorWallet: isCrypto ? linkedWallet : undefined,
      });

      const created = createRes?.data?.data;

      if (!createRes?.data?.success || !created) {
        throw new Error(createRes?.data?.message || "Donation failed");
      }

      if (!isCrypto) {
        if (created?.banking) {
          setBankingPreview(created.banking);
        }

        const paymentUrl = created?.vnpay?.paymentUrl;
        if (!paymentUrl) {
          throw new Error("VNPay paymentUrl not found");
        }

        window.location.href = paymentUrl;
        return;
      }

      const crypto = created?.crypto;
      if (!crypto?.vaultAddress || !crypto?.tokenAddress) {
        throw new Error("Crypto payment info is missing");
      }

      const amountWei = parseUnits(String(form.amount), 18);

      setStepText("Approving USDT...");
      await approveUsdtMock({
        tokenAddress: crypto.tokenAddress,
        spender: crypto.vaultAddress,
        amount: amountWei,
        account: linkedWallet,
      });

      setStepText("Sending donation transaction...");
      const txHash = await donateToVault({
        vaultAddress: crypto.vaultAddress,
        amount: amountWei,
        account: linkedWallet,
      });

      setStepText("Confirming donation...");
      const confirmRes = await confirmCryptoDonation(created.id, {
        txHash,
        donorWallet: linkedWallet,
      });

      if (!confirmRes?.data?.success) {
        throw new Error(confirmRes?.data?.message || "Confirm donation failed");
      }

      onClose?.();
      navigate(`/projects/${project.id}?payment=success&source=crypto`, {
        replace: true,
      });
      return;
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err?.shortMessage ||
          err?.message ||
          "Unable to process donation",
      );
    } finally {
      setLoading(false);
      setStepText("");
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal__header">
          <h2 className="modal__title">Donate to Project</h2>
          <p className="modal__subtitle">{project?.title}</p>
        </div>

        <div className="modal__body">
          <div className="donate-field">
            <label className="donate-label">Quick Amount</label>
            <div className="quick-amounts">
              {QUICK_AMOUNTS_USD.map((a) => (
                <button
                  type="button"
                  key={a}
                  className={`quick-btn ${Number(form.amount) === a ? "quick-btn--active" : ""}`}
                  onClick={() => setField("amount", a)}
                >
                  ${a}
                </button>
              ))}
            </div>
          </div>

          <div className="donate-field">
            <label className="donate-label">Amount (USD)</label>
            <input
              className="donate-input"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
            />
          </div>

          <div className="donate-field">
            <label className="donate-label">Payment Method</label>
            <div className="payment-methods">
              {PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`payment-btn ${form.payment === m ? "payment-btn--active" : ""}`}
                  onClick={() => setField("payment", m)}
                >
                  <span className="payment-icon">
                    {m === "VNPay" ? "💳" : "₿"}
                  </span>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {!isCrypto && Number(form.amount) > 0 && (
            <div className="donate-note">
              VNPay will charge the VND equivalent at the current exchange rate.
            </div>
          )}

          {isCrypto && (
            <div className="donate-field">
              <label className="donate-label">Linked Wallet</label>
              {hasLinkedWallet ? (
                <div className="donate-wallet-box">{linkedWallet}</div>
              ) : (
                <div className="donate-wallet-warning">
                  <span>You have not linked a wallet yet.</span>
                  <button
                    type="button"
                    className="donate-link-btn"
                    onClick={handleGoToProfile}
                  >
                    Go to Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {apiError && <span className="donate-error">{apiError}</span>}
        </div>

        <div className="modal__footer">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            size="md"
            onClick={handleSubmit}
            disabled={loading}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
