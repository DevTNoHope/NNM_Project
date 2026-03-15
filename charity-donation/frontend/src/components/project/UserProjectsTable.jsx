import React from "react";
import Button from "../common/Button";
import "./UserProjectsTable.css";

const STATUS_MAP = {
  DRAFT: { label: "Draft", class: "bg-gray-100 text-gray-700" },
  PENDING: { label: "Pending Review", class: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approved", class: "bg-blue-100 text-blue-700" },
  PUBLISHED: { label: "Published", class: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", class: "bg-red-100 text-red-700" },
  PAUSED: { label: "Paused", class: "bg-gray-100 text-gray-600" },
  COMPLETED: { label: "Completed", class: "bg-purple-100 text-purple-700" },
};

function StatusBadge({ status }) {
  const meta = STATUS_MAP[status] || { label: status, class: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.class}`}>
      {meta.label}
    </span>
  );
}

export default function UserProjectsTable({ projects, onRowClick, onEdit, onSubmit, onDelete, onManage, onView }) {
  return (
    <div className="user-projects-table-wrapper">
      <table className="user-projects-table">
        <thead>
          <tr>
            <th className="table-col-img">Image</th>
            <th>Project</th>
            <th>Goal Amount</th>
            <th>Status</th>
            <th>Date Created</th>
            <th className="table-col-actions">Actions</th>
          </tr>
        </thead>
        <tbody className="user-projects-tbody">
          {projects.map((project) => {
            const canEditOrDelete = project.status === "DRAFT" || project.status === "REJECTED";
            const canManage = project.status === "APPROVED" || project.status === "PUBLISHED";

            return (
              <tr 
                key={project.id} 
                onClick={() => onRowClick(project)}
              >
                <td>
                  {project.cover_image_url ? (
                    <div className="project-img-wrapper">
                      <img src={project.cover_image_url} alt={project.title} />
                    </div>
                  ) : (
                    <div className="project-img-wrapper">
                      <span className="project-img-placeholder">No img</span>
                    </div>
                  )}
                </td>
                <td>
                  <span className="project-title">{project.title}</span>
                </td>
                <td className="project-goal">
                  {Number(project.goal_amount || 0).toLocaleString()} VNĐ
                </td>
                <td>
                  <StatusBadge status={project.status} />
                </td>
                <td className="project-date">
                  {project.created_at ? new Date(project.created_at).toLocaleDateString() : "-"}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="table-actions">
                    {canEditOrDelete && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onEdit(project.id)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onSubmit(project.id)}>
                          Submit
                        </Button>
                        <button 
                          className="btn-delete"
                          onClick={() => onDelete(project.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {canManage && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onView(project.id)}>
                          View Page
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => onManage(project.id)}>
                          Manage
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
