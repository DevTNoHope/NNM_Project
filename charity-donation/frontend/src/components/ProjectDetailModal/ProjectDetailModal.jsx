import React, { useState } from "react";
import http from "../../api/http";

const ProjectDetailModal = ({ project, onClose, onApprove, onReject, onVaultCreated }) => {
  const [note, setNote] = useState("");
  const [creatingVault, setCreatingVault] = useState(false);
  const [vaultResult, setVaultResult] = useState(null);

  if (!project) return null;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="badge-soft-success">APPROVED</span>;
      case 'REJECTED': return <span className="badge-soft-danger">REJECTED</span>;
      case 'PENDING': return <span className="badge-soft-warning">PENDING</span>;
      case 'PUBLISHED': return <span className="badge-soft-secondary">PUBLISHED</span>;
      default: return <span className="badge-soft-secondary">{status}</span>;
    }
  };

  const goal = parseInt(project.goal_amount) || 0;
  const donated = parseFloat(project.total_donated) || 0;
  const percent = goal > 0 ? Math.min(Math.round((donated / goal) * 100), 100) : 0;

  const handleCreateVault = async () => {
    if (!window.confirm("Deploy vault on-chain and publish this project?")) return;

    setCreatingVault(true);
    try {
      const res = await http.post(`/admin/projects/${project.id}/create-vault`);
      
      if (res.data.success) {
        setVaultResult(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create vault");
    } finally {
      setCreatingVault(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-modern" style={{ width: '800px', maxWidth: '95%' }}>
        <div className="modal-header-modern">
           <div>
              <h5>Project Details: {project.title}</h5>
              <p>Review project information before making a decision.</p>
           </div>
           <button className="modal-close-icon" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body-modern" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '300px', flexShrink: 0 }}>
              {project.cover_image_url ? (
                <img 
                   src={project.cover_image_url} 
                   alt={project.title} 
                   style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #E5E7EB' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '200px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', border: '1px dashed #D1D5DB' }}>
                   No Cover Image
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignContent: 'start' }}>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Status:</div>
                  <div>{getStatusBadge(project.status)}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Category:</div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{project.category_name || "Education"}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Founder ID:</div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{project.founder_id}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Goal Amount:</div>
                  <div style={{ fontWeight: 700, color: '#20a8d8' }}>${goal.toLocaleString()}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Created At:</div>
                  <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>{new Date(project.created_at).toLocaleString()}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Updated At:</div>
                  <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>{new Date(project.updated_at).toLocaleString()}</div>
               </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: '#4B5563' }}>Raised: ${donated.toLocaleString()}</span>
              <span style={{ color: '#111827' }}>{percent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ height: '100%', width: `${percent}%`, backgroundColor: percent >= 100 ? '#10B981' : '#20a8d8', transition: 'width 0.3s' }}
              ></div>
            </div>
          </div>

          {/* Vault Address (if PUBLISHED) */}
          {project.vault_address && (
            <div style={{ marginBottom: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Vault Address:</div>
              <a 
                href={`https://testnet.bscscan.com/address/${project.vault_address}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#111827', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                {project.vault_address}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Description:</div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
               {project.description || "No description provided."}
            </p>
          </div>

          {/* PENDING: Approve/Reject note */}
          {project.status === 'PENDING' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                 Decision Note (Optional for Approve, Required for Reject):
              </div>
              <textarea 
                rows="3" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="Reason for your decision..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
              ></textarea>
            </div>
          )}

          {/* APPROVED: Create Vault Button */}
          {project.status === 'APPROVED' && !vaultResult && (
            <div style={{ background: '#EFF6FF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF', marginBottom: '12px' }}>
                🏗️ Create Vault & Publish
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '12px' }}>
                This will upload project metadata to IPFS (Pinata) and deploy a new HopeFundVault contract on BSC Testnet via the Factory contract. The project will be set to PUBLISHED.
              </p>
              <button
                onClick={handleCreateVault}
                disabled={creatingVault}
                className="btn-core btn-success"
                style={{ minWidth: '180px', fontSize: '0.95rem', padding: '10px 24px' }}
              >
                {creatingVault ? "⏳ Deploying on-chain..." : "🚀 Create Vault"}
              </button>
            </div>
          )}

          {/* Vault creation result */}
          {vaultResult && (
            <div style={{ background: '#ECFDF5', padding: '1.25rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>
                ✅ Vault Created Successfully!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ margin: 0 }}>
                  <strong>Vault:</strong>{' '}
                  <a href={`https://testnet.bscscan.com/address/${vaultResult.vaultAddress}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'monospace', color: '#4F46E5' }}>
                    {vaultResult.vaultAddress}
                  </a>
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Tx:</strong>{' '}
                  <a href={`https://testnet.bscscan.com/tx/${vaultResult.txHash}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'monospace', color: '#4F46E5', fontSize: '0.8rem' }}>
                    {vaultResult.txHash}
                  </a>
                </p>
                <p style={{ margin: 0 }}>
                  <strong>IPFS:</strong>{' '}
                  <a href={vaultResult.ipfsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5' }}>
                    {vaultResult.ipfsCid}
                  </a>
                </p>
                <p style={{ margin: 0 }}>
                  <strong>MetaHash:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{vaultResult.metaHash}</span>
                </p>
              </div>
              <button
                onClick={() => { if (onVaultCreated) onVaultCreated(); }}
                className="btn-core btn-success"
                style={{ marginTop: '12px' }}
              >
                Done
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer-modern">
          <button className="btn-core" style={{ background: 'transparent', color: '#6B7280', border: '1px solid #D1D5DB' }} onClick={onClose}>Close</button>
          
          {project.status === 'PENDING' && (
            <>
              <button 
                className="btn-core btn-danger"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
                onClick={() => onReject(project.id, note)}
              >
                Reject
              </button>
              <button 
                className="btn-core btn-success"
                onClick={() => onApprove(project.id, note)}
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
