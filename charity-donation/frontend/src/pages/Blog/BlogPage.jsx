import { useState, useEffect, useMemo } from 'react';
import { getPosts } from '../../api/postApi';
import { filterPosts } from '../../utils/filterPosts';
import PostCard from '../../components/post/PostCard';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import './BlogPage.css';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    getPosts().then(r => { setPosts(r.data); setLoading(false); });
  }, []);

  const cats = ['All', ...new Set(posts.map(p => p.category))];
  const featured = posts.find(p => p.featured);
  const filtered = useMemo(
    () => filterPosts(posts.filter(p => !p.featured || search || cat !== 'All'), { search, category: cat }),
    [posts, search, cat]
  );

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1 className="blog-hero__title">Stories & Updates</h1>
          <p className="blog-hero__sub">Insights, announcements, and impact stories from the HopeFund community.</p>
          <SearchBar value={search} onChange={setSearch} placeholder="Search articles..." className="blog-hero__search" />
        </div>
      </div>

      <div className="container blog-body">
        {loading ? <Spinner center size="lg" /> : (
          <>
            {featured && !search && cat === 'All' && (
              <div className="blog-featured">
                <h2 className="blog-section-title">Featured</h2>
                <div className="blog-featured__card">
                  <PostCard post={featured} featured />
                </div>
              </div>
            )}
            <div className="blog-cats">
              {cats.map(c => (
                <button key={c} className={`filter-pill ${cat === c ? 'filter-pill--active' : ''}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
            {filtered.length === 0
              ? <EmptyState title="No articles found" description="Try a different search or category." />
              : <div className="blog-grid">{filtered.map(p => <PostCard key={p.id} post={p} />)}</div>
            }
          </>
        )}
      </div>
    </div>
  );
};
export default BlogPage;