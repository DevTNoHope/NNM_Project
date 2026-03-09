import './Spinner.css';

const Spinner = ({ size = 'md', center = false }) => (
  <div className={`spinner-wrap ${center ? 'spinner-wrap--center' : ''}`}>
    <div className={`spinner spinner--${size}`} />
  </div>
);
export default Spinner;