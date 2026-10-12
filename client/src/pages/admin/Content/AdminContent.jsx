import { useEffect, useMemo, useState } from "react";
import {
  FaGlobe,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaHome,
  FaInfoCircle,
  FaStar,
  FaEnvelope,
} from "react-icons/fa";

import {
  getAdminPublicContent,
  updateAdminPublicPage,
  resetAdminPublicPage,
  getToken,
} from "../../../services/api";

import "./AdminContent.css";

const pageConfig = {
  home: {
    label: "Home",
    icon: <FaHome />,
  },
  about: {
    label: "About",
    icon: <FaInfoCircle />,
  },
  features: {
    label: "Features",
    icon: <FaStar />,
  },
  contact: {
    label: "Contact",
    icon: <FaEnvelope />,
  },
};

function AdminContent() {
  const [pages, setPages] = useState({});
  const [activePage, setActivePage] = useState("home");
  const [jsonText, setJsonText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeContent = useMemo(
    () => pages[activePage]?.content || {},
    [pages, activePage],
  );

  const loadContent = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      console.log("ADMIN CONTENT TOKEN:", token ? "FOUND" : "NOT FOUND");

      if (!token) {
        throw new Error("Admin session not found. Please login again.");
      }

      const response = await getAdminPublicContent();

      console.log("ADMIN CONTENT LOAD RESPONSE:", response);

      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to load website content.");
      }

      setPages(response.content || {});
    } catch (err) {
      console.error("Load website content error:", err);

      setError(err?.message || "Failed to load website content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    try {
      const content = pages[activePage]?.content || {};

      setJsonText(JSON.stringify(content, null, 2));

      setIsPublished(pages[activePage]?.isPublished ?? true);

      setMessage("");
      setError("");
    } catch (err) {
      console.error("Prepare website content error:", err);

      setJsonText("{}");
      setIsPublished(true);
    }
  }, [activePage, pages]);

  const handleSave = async (event) => {
    event?.preventDefault();

    console.log("=================================");
    console.log("SAVE BUTTON CLICKED");
    console.log("ACTIVE PAGE:", activePage);
    console.log("=================================");

    if (saving) {
      console.log("Already saving...");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = getToken();

      console.log("SAVE TOKEN:", token ? "FOUND" : "NOT FOUND");

      if (!token) {
        throw new Error("Admin session expired. Please login again.");
      }

      let parsedContent;

      try {
        parsedContent = JSON.parse(jsonText);
      } catch (jsonError) {
        console.error("INVALID JSON:", jsonError);

        throw new Error(
          "Invalid JSON. Please check the content before saving.",
        );
      }

      if (
        !parsedContent ||
        typeof parsedContent !== "object" ||
        Array.isArray(parsedContent)
      ) {
        throw new Error("Website content must be a valid JSON object.");
      }

      console.log("CONTENT TO SAVE:", parsedContent);

      console.log("PUBLISHED:", isPublished);

      console.log("SENDING PUT REQUEST...");

      const response = await updateAdminPublicPage(
        activePage,
        parsedContent,
        isPublished,
      );

      console.log("PUT RESPONSE:", response);

      if (!response || response.success === false) {
        throw new Error(
          response?.message || "Server could not save the website content.",
        );
      }

      const savedContent = response.content ?? parsedContent;

      const savedPublished = response.isPublished ?? isPublished;

      setPages((current) => ({
        ...current,
        [activePage]: {
          ...(current[activePage] || {}),
          content: savedContent,
          isPublished: savedPublished,
        },
      }));

      setJsonText(JSON.stringify(savedContent, null, 2));

      setIsPublished(savedPublished);

      setMessage(`${pageConfig[activePage].label} page updated successfully.`);

      console.log("=================================");
      console.log("SAVE SUCCESSFUL");
      console.log("=================================");
    } catch (err) {
      console.error("=================================");
      console.error("SAVE FAILED:", err);
      console.error("=================================");

      setError(err?.message || "Failed to save website content.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (event) => {
    event?.preventDefault();

    if (saving) {
      return;
    }

    const confirmed = window.confirm(
      `Restore the ${pageConfig[activePage].label} page to its default content?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Admin session expired. Please login again.");
      }

      console.log("RESETTING PAGE:", activePage);

      const response = await resetAdminPublicPage(activePage);

      console.log("RESET RESPONSE:", response);

      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to reset page.");
      }

      const resetContent = response.content || {};

      const resetPublished = response.isPublished ?? true;

      setPages((current) => ({
        ...current,
        [activePage]: {
          ...(current[activePage] || {}),
          content: resetContent,
          isPublished: resetPublished,
        },
      }));

      setJsonText(JSON.stringify(resetContent, null, 2));

      setIsPublished(resetPublished);

      setMessage(`${pageConfig[activePage].label} page restored successfully.`);
    } catch (err) {
      console.error("Reset website content error:", err);

      setError(err?.message || "Failed to reset page.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-content-page">
        <div className="admin-content-loading">Loading website content...</div>
      </div>
    );
  }

  return (
    <div className="admin-content-page">
      <div className="admin-content-header">
        <div>
          <span className="admin-content-eyebrow">
            <FaGlobe />
            WEBSITE MANAGEMENT
          </span>

          <h1>Website Content</h1>

          <p>Manage the content displayed on the public FitTrack website.</p>
        </div>
      </div>

      {message && (
        <div className="admin-content-message success">
          <FaCheckCircle />
          <span>{message}</span>
        </div>
      )}

      {error && <div className="admin-content-message error">{error}</div>}

      <div className="admin-content-layout">
        <aside className="admin-content-sidebar">
          <span className="admin-content-sidebar-title">PUBLIC PAGES</span>

          {Object.entries(pageConfig).map(([page, config]) => (
            <button
              key={page}
              type="button"
              className={`admin-content-page-btn ${
                activePage === page ? "active" : ""
              }`}
              onClick={() => {
                if (!saving) {
                  setActivePage(page);
                }
              }}
              disabled={saving}
            >
              {config.icon}

              <span>{config.label}</span>
            </button>
          ))}
        </aside>

        <section className="admin-content-editor">
          <div className="admin-content-editor-header">
            <div>
              <span>{pageConfig[activePage].label} PAGE</span>

              <h2>Edit {pageConfig[activePage].label} Content</h2>
            </div>

            <label className="publish-toggle">
              <span>Published</span>

              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={saving}
              />

              <span className="publish-slider" />
            </label>
          </div>

          <div className="admin-content-json-info">
            Edit the JSON values below. Text, numbers, arrays and image URLs can
            be changed without modifying the React page structure.
          </div>

          <textarea
            className="admin-content-json-editor"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
            disabled={saving}
          />

          <div className="admin-content-actions">
            <button
              type="button"
              className="admin-content-reset-btn"
              onClick={handleReset}
              disabled={saving}
            >
              <FaUndo />

              {saving ? "Please wait..." : "Restore Defaults"}
            </button>

            <button
              type="button"
              className="admin-content-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminContent;
