import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CiShare1 } from "react-icons/ci";
import {
  getMyProfile,
  getPublicProfile,
  getUserProjects,
  getUserDonations,
  sendVerificationOtp,
  verifyOtp,
  updateMyProfile,
} from "../../api/userApi";
import ProjectCard from "../../components/ProjectCard";
import "./ProfilePage.css";
import { Link } from "react-router-dom";

const TABS = ["overview", "projects", "donations"];

export default function ProfilePage({ isMe = false }) {
  const { userId } = useParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [projectsData, setProjectsData] = useState(null);
  const [donationsData, setDonationsData] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleOpen, setGoogleOpen] = useState(false);

  const stats = useMemo(() => {
    if (!profile) return null;

    return (
      profile.stats || {
        total_donations: donationsData?.total_donations || 0,
        total_donated_amount: donationsData?.total_amount || 0,
        total_projects: projectsData?.total_projects || 0,
        total_received: projectsData?.total_received || 0,
      }
    );
  }, [profile, projectsData, donationsData]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (isMe) {
          const meRes = await getMyProfile();
          const me = meRes?.data;

          if (!me || !me.id) {
            throw new Error("Failed to load profile");
          }

          setProfile(me);

          const [projectsRes, donationsRes] = await Promise.all([
            getUserProjects(me.id),
            getUserDonations(me.id),
          ]);

          setProjectsData(projectsRes?.data || null);
          setDonationsData(donationsRes?.data || null);
        } else {
          if (!userId) throw new Error("User ID is missing");

          const [profileRes, projectsRes, donationsRes] = await Promise.all([
            getPublicProfile(userId),
            getUserProjects(userId),
            getUserDonations(userId),
          ]);

          setProfile(profileRes?.data || null);
          setProjectsData(projectsRes?.data || null);
          setDonationsData(donationsRes?.data || null);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err?.response?.data?.message || "User not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isMe, userId]);

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      await sendVerificationOtp();
      setOtpOpen(true);
      alert("Verification code sent to your email.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setVerifyingOtp(true);
      await verifyOtp(otp);

      setProfile((prev) => ({
        ...prev,
        is_verified: 1,
      }));

      setOtp("");
      setOtpOpen(false);
      alert("Account verified successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleUpdateProfile = async (formValues) => {
    try {
      const res = await updateMyProfile(formValues);
      const updatedUser = res?.data;

      setProfile((prev) => ({
        ...prev,
        ...updatedUser,
        stats: prev?.stats,
      }));

      setEditOpen(false);
      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Profile update failed");
    }
  };

  const handleLinkWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask wallet not found");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts?.[0];
      if (!walletAddress) return;

      await handleUpdateProfile({
        name: profile?.name || "",
        linked_wallet: walletAddress,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to link wallet");
    }
  };

  const handleLinkGoogle = () => {
    setGoogleOpen(true);
  };

  const handleSaveGoogle = async () => {
    try {
      await handleUpdateProfile({
        name: profile?.name || "",
        email: googleEmail,
        linked_wallet: profile?.linked_wallet || null,
      });

      setGoogleOpen(false);
      setGoogleEmail("");
    } catch (err) {
      console.error(err);
      alert("Failed to link email");
    }
  };

  const mappedProjects = useMemo(() => {
    if (!projectsData?.projects) return [];

    return projectsData.projects.map((p) => ({
      id: p.id,
      slug: p.slug || p.id,
      banner: p.cover_image_url || "https://placehold.co/600x320?text=Project",
      title: p.title,
      category: p.category_name || "General",
      organization: profile?.name || "HopeFund",
      excerpt: (p.description || "No description available.").replace(/<[^>]*>?/gm, ''),
      raised: Number(p.total_received || 0),
      goal: Number(p.goal_amount || 0),
      donors: Number(p.total_donors || 0),
      daysLeft: Number(p.days_left || 0),
      verified: p.status === "APPROVED",
      featured: false,
    }));
  }, [projectsData, profile]);

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <p>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p>User not found.</p>
      </div>
    );
  }

  const hasEmail = Boolean(profile.email);
  const hasWallet = Boolean(profile.linked_wallet);
  const isVerified = profile.is_verified === 1;

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">
          <img
            src="https://giveth.io/images/placeholders/profile.svg"
            alt="avatar"
          />
        </div>

        <div className="profile-meta">
          <div className="profile-name-row">
            <h1>{profile.name || "Unnamed User"}</h1>
            {isVerified && (
              <span className="verified-badge" title="Verified account">
                ✓
              </span>
            )}
          </div>

          <p className="profile-email">{profile.email || "No email linked"}</p>
          <p className="profile-wallet">
            {profile.linked_wallet || "Wallet not linked"}
          </p>

          {isMe && (
            <div className="profile-actions">
              <button onClick={() => setEditOpen(true)}>Edit Profile</button>

              {!hasEmail && (
                <button onClick={handleLinkGoogle}>Link Google</button>
              )}

              {hasEmail && !isVerified && (
                <button onClick={handleSendOtp} disabled={sendingOtp}>
                  {sendingOtp ? "Sending..." : "Verify Email"}
                </button>
              )}

              {!hasWallet && (
                <button onClick={handleLinkWallet}>Link Wallet</button>
              )}
            </div>
          )}

          {googleOpen && (
            <div className="google-box">
              <input
                type="email"
                placeholder="Enter your Gmail"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
              />
              <button onClick={handleSaveGoogle}>Save Email</button>
            </div>
          )}

          {isMe && otpOpen && hasEmail && !isVerified && (
            <div className="otp-box">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={handleVerifyOtp} disabled={verifyingOtp}>
                {verifyingOtp ? "Verifying..." : "Confirm OTP"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="profile-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" && "Overview"}
            {tab === "projects" && "Projects"}
            {tab === "donations" && "Donations"}
          </button>
        ))}
      </section>

      {activeTab === "overview" && (
        <section className="overview-grid">
          <div className="stat-card">
            <span>Donations</span>
            <strong>{stats?.total_donations || 0}</strong>
          </div>

          <div className="stat-card">
            <span>Total Amount Donated</span>
            <strong>
              ${Number(stats?.total_donated_amount || 0).toLocaleString()}
            </strong>
          </div>

          <div className="stat-card">
            <span>Projects</span>
            <strong>{stats?.total_projects || 0}</strong>
          </div>

          <div className="stat-card">
            <span>Donations Received</span>
            <strong>
              ${Number(stats?.total_received || 0).toLocaleString()}
            </strong>
          </div>
        </section>
      )}

      {activeTab === "projects" && (
        <section className="projects-list">
          <div className="sub-stat-row">
            <div className="mini-stat">
              <span>Projects</span>
              <strong>{projectsData?.total_projects || 0}</strong>
            </div>

            <div className="mini-stat">
              <span>Donations Received</span>
              <strong>
                ${Number(projectsData?.total_received || 0).toLocaleString()}
              </strong>
            </div>
          </div>

          {mappedProjects.length ? (
            <div className="profile-project-grid">
              {mappedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p>No projects found.</p>
          )}
        </section>
      )}

      {activeTab === "donations" && (
        <section className="donations-list">
          <div className="sub-stat-row">
            <div className="mini-stat">
              <span>Donations</span>
              <strong>{donationsData?.total_donations || 0}</strong>
            </div>

            <div className="mini-stat">
              <span>Total Amount Donated</span>
              <strong>
                ${Number(donationsData?.total_amount || 0).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="donation-table">
            <div className="donation-head">
              <span>Date</span>
              <span>Project</span>
              <span>Type</span>
              <span>Amount</span>
            </div>

            {donationsData?.donations?.length ? (
              donationsData.donations.map((item) => {
                const isCrypto = item.donation_type === "CRYPTO";
                const txUrl = item.tx_hash
                  ? `https://testnet.bscscan.com/tx/${item.tx_hash}`
                  : null;

                return (
                  <div className="donation-row" key={item.id}>
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      <Link
                        to={`/projects/${item.project_slug || item.project_id}`}
                        className="donation-project-link"
                      >
                        {item.project_title}
                      </Link>
                    </span>
                    <span>{item.donation_type}</span>
                    <span className="donation-amount-cell">
                      {item.amount}
                      {isCrypto && txUrl && (
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="tx-link"
                          title="View transaction"
                        >
                          <CiShare1 />
                        </a>
                      )}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="donation-row">
                <span>No donations found.</span>
              </div>
            )}
          </div>
        </section>
      )}

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdateProfile}
        />
      )}
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSubmit }) {
  const [name, setName] = useState(profile?.name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      linked_wallet: profile?.linked_wallet || null,
    });
  };

  return (
    <div className="profile-modal-backdrop">
      <div className="profile-modal">
        <h3>Edit Profile</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={profile?.email || ""} disabled />
          </div>

          <div className="form-group">
            <label>Wallet</label>
            <input value={profile?.linked_wallet || ""} disabled />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
