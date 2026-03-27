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
  getMyBadges,
  getMyBadgeProgress,
  setMySelectedBadge,
  getUserBadges,
  getUserBadgeProgress
} from "../../api/userApi";
import ProjectCard from "../../components/ProjectCard";
import "./ProfilePage.css";
import { Link } from "react-router-dom";

export default function ProfilePage({ isMe = false }) {
  const { userId } = useParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [projectsData, setProjectsData] = useState(null);
  const [donationsData, setDonationsData] = useState(null);
  const [badgesData, setBadgesData] = useState(null);
  const [badgeProgress, setBadgeProgress] = useState(null);

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

        let profileObj = null;
        let pId = userId;

        if (isMe) {
          const meRes = await getMyProfile();
          profileObj = meRes?.data;
          pId = profileObj?.id;
        } else {
          if (!userId) throw new Error("User ID is missing");
          const profileRes = await getPublicProfile(userId);
          profileObj = profileRes?.data;
        }

        if (!profileObj || !profileObj.id) {
          throw new Error("Failed to load profile");
        }

        setProfile(profileObj);

        // Fetch everything else
        const [projectsRes, donationsRes, badgesRes, progressRes] = await Promise.all([
          getUserProjects(pId),
          getUserDonations(pId),
          isMe ? getMyBadges() : getUserBadges(pId),
          isMe ? getMyBadgeProgress() : getUserBadgeProgress(pId),
        ]);

        setProjectsData(projectsRes?.data || null);
        setDonationsData(donationsRes?.data || null);
        setBadgesData(badgesRes?.data || []);
        setBadgeProgress(progressRes?.data || null);

      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err?.response?.data?.message || "User not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isMe, userId]);

  useEffect(() => {
    if (!isMe && activeTab === "badges") {
      setActiveTab("overview");
    }
  }, [isMe, activeTab]);

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

  const handleSetBadge = async (badgeId) => {
    try {
      await setMySelectedBadge(badgeId);
      const [meRes, badgesRes] = await Promise.all([getMyProfile(), getMyBadges()]);
      setProfile(meRes.data);
      setBadgesData(badgesRes.data);
      alert("Display badge updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update badge");
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
  const availableTabs = isMe
    ? ["overview", "projects", "donations", "badges"]
    : ["overview", "projects", "donations"];

  const getProgressWidth = (totalPoints, allBadges) => {
    if (!allBadges || allBadges.length < 2) return 0;
    
    // There are (N-1) gaps between N markers
    const numGaps = allBadges.length - 1;
    const gapWidth = 100 / numGaps;

    // Is the user below the first marker? (e.g. < 100 pts)
    if (totalPoints < allBadges[0].min_points) {
      return 0; // The markers start at the very beginning
    }

    // Find which gap the user is currently in
    let gapIndex = -1;
    for (let i = 0; i < numGaps; i++) {
      if (totalPoints >= allBadges[i].min_points && (i === numGaps - 1 || totalPoints < allBadges[i+1].min_points)) {
        gapIndex = i;
        break;
      }
    }

    if (gapIndex === -1) return 100; // All badges achieved

    // Calculate progress within that specific gap
    const prevPoints = allBadges[gapIndex].min_points;
    const nextPoints = gapIndex < numGaps ? allBadges[gapIndex + 1].min_points : prevPoints;
    
    if (totalPoints >= allBadges[numGaps].min_points) return 100;
    
    const percentageInGap = (totalPoints - prevPoints) / (nextPoints - prevPoints);
    return (gapIndex * gapWidth) + (percentageInGap * gapWidth);
  };

  const progressWidth = badgeProgress?.allBadges ? getProgressWidth(badgeProgress.totalPoints, badgeProgress.allBadges) : 0;

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
            {profile.selectedBadge && (
              <span 
                className="profile-badge-tag" 
                style={{ 
                  backgroundColor: profile.selectedBadge.color || '#9c27b0',
                  boxShadow: `0 4px 14px ${profile.selectedBadge.color || '#9c27b0'}66`
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z"/>
                  <path d="M8.286 14.114L6 21L12 18.5L18 21L15.714 14.114C14.6541 15.2892 13.3989 15.9984 12 16C10.6011 15.9984 9.34591 15.2892 8.286 14.114Z"/>
                </svg>
                {profile.selectedBadge.name}
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
        {availableTabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" && "Overview"}
            {tab === "projects" && "Projects"}
            {tab === "donations" && "Donations"}
            {tab === "badges" && "Badges"}
          </button>
        ))}
      </section>
      {activeTab === "overview" && (
        <div className="overview-container">
          {badgeProgress && (
            <section className="dashboard-progression-wrapper">
              <h2 className="dp-main-title">Badge Achievements</h2>
              <div className="dashboard-progression-card horizontal-layout">
                
                {/* Top Section */}
                <div className="dp-top-section">
                  <div className="dp-info-block">
                    <span className="dp-label">Total Points:</span>
                    <strong className="dp-value-large">{Number(badgeProgress.totalPoints).toLocaleString()} pts</strong>
                  </div>
                  
                  <div className="dp-divider-v"></div>
                  
                  <div className="dp-info-block dp-current-block">
                    <div className="dp-current-icon-wrapper">
                      {(profile.selectedBadge?.icon_url || badgeProgress.currentBadge?.icon_url) ? (
                        <img src={profile.selectedBadge?.icon_url || badgeProgress.currentBadge.icon_url} alt="badge" className="dp-current-icon" />
                      ) : (
                        <div className="dp-current-badge-placeholder" style={{ backgroundColor: profile.selectedBadge?.color || badgeProgress.currentBadge?.color || '#8b5cf6' }}>
                           {(profile.selectedBadge?.name || badgeProgress.currentBadge?.name || 'R').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="dp-current-text">
                       <span className="dp-label">Current Rank:</span>
                       <strong className="dp-value-large">{profile.selectedBadge?.name || badgeProgress.currentBadge?.name || 'None'}</strong>
                    </div>
                  </div>
                </div>

                <div className="dp-divider-h"></div>

                {/* Timeline Section */}
                <div className="dp-timeline-container-hz">
                   <div className="dp-timeline-track-hz">
                      <div 
                        className="dp-timeline-fill-hz" 
                        style={{ 
                          width: `${progressWidth}%`,
                          background: `linear-gradient(90deg, #10b981 0%, #0ea5e9 33%, #8b5cf6 66%, #f59e0b 100%)`
                        }} 
                      />
                   </div>
                   
                   <div className="dp-timeline-markers-hz">
                      {badgeProgress.allBadges?.map((b, index) => {
                         const totalBadges = badgeProgress.allBadges.length;
                         // distribute them evenly along the line.
                         const leftPos = (index / (Math.max(1, totalBadges - 1))) * 100;
                         const achieved = badgeProgress.totalPoints >= b.min_points;
                         const isCurrentBadge = badgeProgress.currentBadge?.id === b.id;
                         
                         return (
                           <div 
                             key={b.id || b.badge_id || index} 
                             className={`dp-marker-hz ${achieved ? 'achieved' : ''} ${isCurrentBadge ? 'current' : ''}`}
                             style={{ left: `${leftPos}%` }}
                           >
                             <div 
                               className="dp-marker-circle-hz" 
                               style={{ 
                                 backgroundColor: achieved ? (b.color || '#10b981') : '#e2e8f0', 
                                 boxShadow: isCurrentBadge ? `0 0 0 10px ${b.color || '#f59e0b'}33, 0 0 20px ${b.color || '#f59e0b'}66` : 'none',
                                 transform: isCurrentBadge ? 'scale(1.5)' : 'scale(1)'
                               }}
                             >
                                <span className="dp-check-hz">✓</span>
                             </div>
                             <div className="dp-marker-label-hz" style={{ marginTop: isCurrentBadge ? '24px' : '16px' }}>
                               <div className="dp-marker-icon-small">
                                  {/* Small placeholder ribbon icon */}
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill={b.color || '#10b981'} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z"/>
                                    <path d="M8.286 14.114L6 21L12 18.5L18 21L15.714 14.114C14.6541 15.2892 13.3989 15.9984 12 16C10.6011 15.9984 9.34591 15.2892 8.286 14.114Z"/>
                                  </svg>
                               </div>
                               <strong style={{ color: '#1e293b' }}>{b.name}</strong>
                               <span>{Number(b.min_points).toLocaleString()} pts</span>
                             </div>
                           </div>
                         );
                      })}
                   </div>
                </div>

                <div className="dp-divider-h"></div>

                {/* Status Section */}
                <div className="dp-status-message-hz">
                  {badgeProgress.nextBadge ? (
                    <p>Keep going! You need <strong>{Number(badgeProgress.pointsNeeded).toLocaleString()} more points</strong> to unlock <strong>{badgeProgress.nextBadge.name}</strong>.</p>
                  ) : (
                    <p>Congratulations! You have reached the highest rank. Continue your contributions to earn more points and unlock future achievements.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="overview-grid">
            <div className="stat-card">
              <span>Donations</span>
              <strong>{stats?.total_donations || 0}</strong>
            </div>
            <div className="stat-card">
              <span>Total Amount Donated</span>
              <strong>${Number(stats?.total_donated_amount || 0).toLocaleString()}</strong>
            </div>
            <div className="stat-card">
              <span>Projects</span>
              <strong>{stats?.total_projects || 0}</strong>
            </div>
            <div className="stat-card">
              <span>Donations Received</span>
              <strong>${Number(stats?.total_received || 0).toLocaleString()}</strong>
            </div>
          </section>
        </div>
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

      {activeTab === "badges" && isMe && (
        <section className="achievement-gallery-section">
          {badgeProgress && (
            <div className="gallery-header-card">
              <div className="gallery-summary-item">
                <span className="gs-label">Total Points</span>
                <strong className="gs-value">{Number(badgeProgress.totalPoints).toLocaleString()}</strong>
              </div>
              <div className="gallery-summary-divider" />
              <div className="gallery-summary-item">
                <span className="gs-label">Current Badge</span>
                <strong className="gs-value" style={{ color: profile?.selectedBadge?.color || badgeProgress.currentBadge?.color || '#9c27b0' }}>
                  {profile?.selectedBadge?.name || badgeProgress.currentBadge?.name || 'None'}
                </strong>
              </div>
              <div className="gallery-summary-divider" />
              <div className="gallery-summary-item">
                <span className="gs-label">Unlocked</span>
                <strong className="gs-value">{badgesData?.length || 0} / {badgeProgress.allBadges?.length || 0}</strong>
              </div>
            </div>
          )}
          
          <div className="achievement-badge-grid">
            {badgeProgress?.allBadges?.length ? (
              badgeProgress.allBadges.map(b => {
                const isLocked = badgeProgress.totalPoints < b.min_points;
                const earnedBadge = badgesData?.find(eb => (eb.badge_id === b.id || eb.badge_id === b.badge_id));
                const isCurrent = profile?.selectedBadge?.id === b.id || earnedBadge?.is_selected === 1;
                
                const cardClass = isLocked ? "achievement-card locked" : isCurrent ? "achievement-card current" : "achievement-card earned";
                
                return (
                  <div key={b.id || b.badge_id} className={cardClass} style={{ '--badge-color': b.color || '#9c27b0' }}>
                     <div className="ac-icon-wrapper" style={{ backgroundColor: isLocked ? '#f1f5f9' : `${b.color}15` }}>
                        {b.icon_url ? (
                          <img src={b.icon_url} alt={b.name} className="ac-icon" style={{ filter: isLocked ? 'grayscale(100%) opacity(0.4)' : 'none' }} />
                        ) : (
                          <div className="ac-icon-placeholder" style={{ backgroundColor: isLocked ? '#cbd5e1' : b.color }}>
                            {b.name.charAt(0)}
                          </div>
                        )}
                        {isCurrent && <div className="ac-current-indicator">Current</div>}
                        {!isLocked && !isCurrent && <div className="ac-check-indicator">✓</div>}
                     </div>
                     <div className="ac-content">
                       <h4 className="ac-name">{b.name}</h4>
                       <p className="ac-req">{Number(b.min_points).toLocaleString()} pts required</p>
                       <p className="ac-desc">{b.description}</p>
                     </div>
                     <div className="ac-action">
                       {isLocked ? (
                         <span className="ac-status-text locked-text">🔒 Locked</span>
                       ) : isCurrent ? (
                         <span className="ac-status-text current-text">Using Display Badge</span>
                       ) : (
                         isMe ? <button className="btn-set-display" onClick={() => handleSetBadge(b.id || b.badge_id)}>Set as Display Badge</button> : <span className="ac-status-text earned-text">Earned</span>
                       )}
                     </div>
                  </div>
                )
              })
            ) : (
              <p>No badges available.</p>
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
