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
