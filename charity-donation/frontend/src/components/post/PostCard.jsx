import { Link } from 'react-router-dom';
import Tag from '../common/Tag';
import { formatDate } from '../../utils/formatCurrency';
import './PostCard.css';

const PostCard = ({ post, featured = false }) => (
  <Link to={`/blog/${post.slug}`} className={`post-card ${featured ? 'post-card--featured' : ''}`}>
    <div className="post-card__image">
      <img src={post.image} alt={post.title} loading="lazy" />
    </div>
    <div className="post-card__body">
      <Tag color="primary">{post.category}</Tag>
      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__excerpt">{post.excerpt}</p>
      <div className="post-card__meta">
        <span>{formatDate(post.createdAt)}</span>
        <span className="post-card__read">READ MORE →</span>
      </div>
    </div>
  </Link>
);
export default PostCard;