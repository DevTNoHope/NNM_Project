import React from "react";
import Button from "../../common/Button";
import "./PostUpdateForm.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  List,
  Link,
  Heading,
  BlockQuote
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

export default function PostUpdateForm({ newUpdate, setNewUpdate, onSubmit, submittingUpdate }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      setNewUpdate({
        ...newUpdate, 
        imageFile: file, 
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

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
        <div className="form-group" style={{ marginBottom: "2rem" }}>
          <label>Content *</label>
          <div className="ckeditor-container" style={{ color: '#000' }}>
            <CKEditor
              editor={ClassicEditor}
              config={{
                licenseKey: 'GPL',
                plugins: [
                  Essentials, Paragraph, Bold, Italic, List, Link, Heading, BlockQuote
                ],
                toolbar: [
                  'heading', '|',
                  'bold', 'italic', '|',
                  'link', 'bulletedList', 'numberedList', 'blockQuote'
                ],
                placeholder: 'Share details about the progress...'
              }}
              data={newUpdate.content || ""}
              onChange={(event, editor) => {
                const data = editor.getData();
                setNewUpdate({...newUpdate, content: data});
              }}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Image (Optional)</label>
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ padding: '8px' }}
          />
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Max 5MB. JPG, PNG, WebP</span>
          {newUpdate.imagePreview && (
            <img 
              src={newUpdate.imagePreview} 
              alt="Preview" 
              style={{ 
                width: '100%', 
                maxHeight: '200px', 
                objectFit: 'cover', 
                borderRadius: '8px', 
                marginTop: '8px',
                border: '1px solid #E5E7EB' 
              }} 
            />
          )}
        </div>
        <Button type="submit" variant="primary" disabled={submittingUpdate} className="w-full">
          {submittingUpdate ? "Posting..." : "Post Update"}
        </Button>
      </form>
    </div>
  );
}
