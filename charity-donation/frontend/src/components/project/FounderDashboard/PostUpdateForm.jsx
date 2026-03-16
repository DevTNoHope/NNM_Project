import React from "react";
import Button from "../../common/Button";
import "./PostUpdateForm.css";
export default function PostUpdateForm({ newUpdate, setNewUpdate, onSubmit, submittingUpdate }) {
  return (
    <div className="card">
      <h2 className="card-title">Post New Update</h2>
      <form className="update-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Update Title *</label>
          <input 
            required
            type="text" 
            value={newUpdate.title}
            onChange={e => setNewUpdate({...newUpdate, title: e.target.value})}
            placeholder="e.g.: Phase 1 completed!" 
          />
        </div>
        <div className="form-group">
          <label>Content *</label>
          <textarea 
            required
            rows="4"
            value={newUpdate.content}
            onChange={e => setNewUpdate({...newUpdate, content: e.target.value})}
            placeholder="Share details about the progress..."
          />
        </div>
        <div className="form-group">
          <label>Image URL (Optional)</label>
          <input 
            type="url" 
            value={newUpdate.imageUrl}
            onChange={e => setNewUpdate({...newUpdate, imageUrl: e.target.value})}
            placeholder="https://..." 
          />
        </div>
        <Button type="submit" variant="primary" disabled={submittingUpdate} className="w-full">
          {submittingUpdate ? "Posting..." : "Post Update"}
        </Button>
      </form>
    </div>
  );
}
