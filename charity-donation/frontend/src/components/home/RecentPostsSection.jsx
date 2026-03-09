import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../api/postApi';
import PostCard from '../post/PostCard';
import Spinner from '../common/Spinner';
import './RecentPostsSection.css';

const RecentPostsSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts().then(r => { setPosts(r.data.slice(0, 3)); setLoading(false); });
  }, []);

  return (
    <section className="recent-posts">
      <div className="container">
        <div className="recent-posts__header">
          <h2 className="recent-posts__title">Recent posts</h2>
          <Link to="/blog" className="recent-posts__link">Visit Our Blogs →</Link>
        </div>
        {loading ? <Spinner center /> : (
          <div className="recent-posts__grid">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </section>
  );
};
export default RecentPostsSection;