import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', as: Tag = 'button', className = '', ...props }) => (
  <Tag className={`btn btn--${variant} btn--${size} ${className}`} {...props}>
    {children}
  </Tag>
);

export default Button;