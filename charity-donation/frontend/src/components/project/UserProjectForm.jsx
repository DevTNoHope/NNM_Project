import React from "react";
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
import Button from "../common/Button";
import "./UserProjectForm.css";

export default function UserProjectForm({
  formData,
  categories,
  isEditing,
  saving,
  onChange,
  onSubmit,
  onCancel,
  onFileChange,
  imagePreview
}) {
  return (
    <form className="user-projects-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="title" className="form-label">Campaign Name *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={onChange}
          className="form-input"
          placeholder="e.g.: Help children in high mountains..."
        />
      </div>

      <div className="form-row-2">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="category_id" className="form-label">Category *</label>
          <select
            id="category_id"
            name="category_id"
            required
            value={formData.category_id}
            onChange={onChange}
            className="form-input"
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="goal_amount" className="form-label">Goal Amount ($) *</label>
          <input
            id="goal_amount"
            name="goal_amount"
            type="number"
            min="10000"
            required
            value={formData.goal_amount}
            onChange={onChange}
            className="form-input"
            placeholder="1000000"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="coverImage" className="form-label">Cover Image</label>
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="form-input"
          style={{ padding: '8px' }}
        />
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Max 5MB. JPG, PNG, WebP</span>
      </div>

      {/* Image Preview */}
      {(imagePreview || formData.image_url) && (
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Preview</label>
          <img
            src={imagePreview || formData.image_url}
            alt="Cover preview"
            style={{
              width: '100%',
              maxHeight: '250px',
              objectFit: 'cover',
              borderRadius: '12px',
              border: '1px solid #E5E7EB'
            }}
          />
        </div>
      )}

      <div className="form-group" style={{ marginBottom: "2rem" }}>
        <label htmlFor="description" className="form-label">Detailed Description *</label>
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
              placeholder: 'Tell the story about your campaign...'
            }}
            data={formData.description || ""}
            onChange={(event, editor) => {
              const data = editor.getData();
              onChange({ target: { name: 'description', value: data } });
            }}
          />
        </div>
      </div>

      <div className="form-actions-row">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Save Draft"}
        </Button>
      </div>
    </form>
  );
}
