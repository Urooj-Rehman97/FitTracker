import { useEffect, useState } from "react";

import {
  FaUser,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaBirthdayCake,
  FaRulerVertical,
  FaDumbbell,
  FaChartLine,
  FaBullseye,
} from "react-icons/fa";

import "./Profile.css";

import { authRequest } from "../../../services/api";

const defaultProfile = {
  name: "Alex Morgan",
  email: "alex@example.com",
  phone: "",
  gender: "",
  dob: "",
  height: "",
  bio: "",
  photo: "",
};

const getStoredArray = (key) => {
  try {
    const data = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

// ================= CURRENT USER =================
const getLoggedUser = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem(
        "fittrackUser"
      ) || "null"
    );
  } catch {
    return null;
  }
};

// ================= USER-SPECIFIC PROFILE KEY =================
const getProfileStorageKey = (user) => {
  if (!user) return null;

  const userId =
    user.id ||
    user._id ||
    user.email;

  if (!userId) return null;

  return `fittrackProfile_${userId}`;
};

// ================= COMPRESS PROFILE PHOTO =================
const compressImage = (
  file,
  maxWidth = 800,
  quality = 0.75
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
          const ratio =
            maxWidth / width;

          width = maxWidth;
          height = Math.round(
            height * ratio
          );
        }

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width = width;
        canvas.height = height;

        const context =
          canvas.getContext("2d");

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            quality
          );

        resolve(compressedImage);
      };

      image.onerror = () => {
        reject(
          new Error(
            "Unable to process the selected image."
          )
        );
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Unable to read the selected image."
        )
      );
    };

    reader.readAsDataURL(file);
  });
};

function Profile() {
  const [profile, setProfile] = useState(() => {
    try {
      const loggedUser =
        getLoggedUser();

      const profileKey =
        getProfileStorageKey(
          loggedUser
        );

      const saved = profileKey
        ? JSON.parse(
            localStorage.getItem(
              profileKey
            ) || "null"
          )
        : null;

      return {
        ...defaultProfile,
        ...saved,

        name:
          loggedUser?.name ||
          saved?.name ||
          defaultProfile.name,

        email:
          loggedUser?.email ||
          saved?.email ||
          defaultProfile.email,
      };
    } catch {
      return defaultProfile;
    }
  });

  const [form, setForm] =
    useState(profile);

  const [editing, setEditing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // Tracks whether the photo itself was changed.
  const [photoChanged, setPhotoChanged] =
    useState(false);

  // ================= LOAD PROFILE FROM BACKEND =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response =
          await authRequest(
            "/profile"
          );

        console.log(
          "PROFILE LOAD RESPONSE:",
          response
        );

        console.log(
          "HEIGHT FROM DATABASE:",
          response.user?.height
        );

        if (
          response.success &&
          response.user
        ) {
          const backendProfile =
            response.user;

          const updatedProfile = {
            ...defaultProfile,

            name:
              backendProfile.name ||
              "",

            email:
              backendProfile.email ||
              "",

            phone:
              backendProfile.phone ||
              "",

            gender:
              backendProfile.gender ||
              "",

            dob:
              backendProfile.dateOfBirth
                ? backendProfile.dateOfBirth.slice(
                    0,
                    10
                  )
                : "",

            height:
              backendProfile.height !==
                null &&
              backendProfile.height !==
                undefined
                ? String(
                    backendProfile.height
                  )
                : "",

            bio:
              backendProfile.bio ||
              "",

            photo:
              backendProfile.profilePhoto ||
              "",
          };

          setProfile(
            updatedProfile
          );

          setForm(
            updatedProfile
          );

          // Backend photo has not been changed by the user.
          setPhotoChanged(false);

          // ================= SAVE CURRENT USER PROFILE ONLY =================
          try {
            const loggedUser =
              getLoggedUser();

            const profileKey =
              getProfileStorageKey(
                loggedUser
              );

            if (profileKey) {
              localStorage.setItem(
                profileKey,
                JSON.stringify(
                  updatedProfile
                )
              );
            }

            if (loggedUser) {
              const currentUser = {
                ...loggedUser,

                id:
                  loggedUser.id ||
                  loggedUser._id ||
                  backendProfile.id,

                name:
                  updatedProfile.name,

                email:
                  updatedProfile.email,

                role:
                  loggedUser.role ||
                  backendProfile.role,

                profilePhoto:
                  updatedProfile.photo ||
                  loggedUser.profilePhoto ||
                  "",
              };

              sessionStorage.setItem(
                "fittrackUser",
                JSON.stringify(
                  currentUser
                )
              );
            }
          } catch (
            storageError
          ) {
            console.error(
              "Profile storage error:",
              storageError
            );
          }
        }
      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        setMessage(
          error.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ================= FORM CHANGE =================
  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  // ================= EDIT =================
  const handleEdit = () => {
    setForm(profile);
    setPhotoChanged(false);
    setEditing(true);
    setMessage("");
  };

  // ================= CANCEL =================
  const handleCancel = () => {
    setForm(profile);
    setPhotoChanged(false);
    setEditing(false);
    setMessage("");
  };

  // ================= SAVE PROFILE =================
  const handleSave = async (e) => {
    e.preventDefault();

    const name =
      form.name.trim();

    const email =
      form.email.trim();

    if (!name || !email) {
      setMessage(
        "Name and email are required."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      console.log(
        "HEIGHT BEING SENT:",
        form.height
      );

      console.log(
        "HEIGHT NUMBER BEING SENT:",
        form.height
          ? Number(form.height)
          : null
      );

      // ================= BUILD REQUEST BODY =================
      const profileData = {
        name,
        email,

        phone:
          form.phone.trim(),

        gender:
          form.gender
            ? form.gender.toLowerCase()
            : "",

        dateOfBirth:
          form.dob || null,

        height:
          form.height
            ? Number(
                form.height
              )
            : null,

        bio:
          form.bio.trim(),
      };

      // IMPORTANT:
      // Only send profilePhoto when the user
      // actually changed or removed the photo.
      if (photoChanged) {
        profileData.profilePhoto =
          form.photo || "";
      }

      console.log(
        "PROFILE UPDATE DATA:",
        {
          ...profileData,
          profilePhoto:
            profileData.profilePhoto
              ? `[image ${Math.round(
                  profileData
                    .profilePhoto
                    .length / 1024
                )} KB]`
              : profileData.profilePhoto,
        }
      );

      const response =
        await authRequest(
          "/profile",
          {
            method: "PUT",

            body: JSON.stringify(
              profileData
            ),
          }
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Profile update failed."
        );
      }

      const backendProfile =
        response.user;

      const updatedProfile = {
        ...defaultProfile,

        name:
          backendProfile.name ||
          name,

        email:
          backendProfile.email ||
          email,

        phone:
          backendProfile.phone ||
          "",

        gender:
          backendProfile.gender ||
          "",

        dob:
          backendProfile.dateOfBirth
            ? backendProfile.dateOfBirth.slice(
                0,
                10
              )
            : "",

        height:
          backendProfile.height !==
            null &&
          backendProfile.height !==
            undefined
            ? String(
                backendProfile.height
              )
            : "",

        bio:
          backendProfile.bio ||
          "",

        photo:
          backendProfile.profilePhoto ||
          "",
      };

      setProfile(
        updatedProfile
      );

      setForm(
        updatedProfile
      );

      setPhotoChanged(false);

      // ================= SAVE CURRENT USER PROFILE ONLY =================
      try {
        const loggedUser =
          getLoggedUser();

        const profileKey =
          getProfileStorageKey(
            loggedUser
          );

        if (profileKey) {
          localStorage.setItem(
            profileKey,
            JSON.stringify(
              updatedProfile
            )
          );
        }

        if (loggedUser) {
          const currentUser = {
            ...loggedUser,

            id:
              loggedUser.id ||
              loggedUser._id ||
              backendProfile.id,

            name:
              updatedProfile.name,

            email:
              updatedProfile.email,

            role:
              loggedUser.role ||
              backendProfile.role,

            profilePhoto:
              updatedProfile.photo ||
              "",
          };

          sessionStorage.setItem(
            "fittrackUser",
            JSON.stringify(
              currentUser
            )
          );
        }
      } catch (
        storageError
      ) {
        console.error(
          "Profile storage save error:",
          storageError
        );
      }

      setEditing(false);

      setMessage(
        "Profile updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= PHOTO CHANGE =================
  const handlePhotoChange = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "Please select a valid image."
      );
      return;
    }

    // Original file limit
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Image size should be less than 5MB."
      );
      return;
    }

    try {
      setMessage(
        "Processing profile photo..."
      );

      const compressedImage =
        await compressImage(
          file,
          800,
          0.75
        );

      // Extra safety check after compression.
      if (
        compressedImage.length >
        2_000_000
      ) {
        setMessage(
          "Image is still too large. Please choose a smaller image."
        );
        return;
      }

      setForm((prev) => ({
        ...prev,
        photo:
          compressedImage,
      }));

      setProfile((prev) => ({
        ...prev,
        photo:
          compressedImage,
      }));

      setPhotoChanged(true);

      setMessage(
        "Profile photo selected. Click Save Changes to save it."
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Photo processing error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to process the selected image."
      );
    }
  };

  // ================= REMOVE PHOTO =================
  const removePhoto = () => {
    setForm((prev) => ({
      ...prev,
      photo: "",
    }));

    setProfile((prev) => ({
      ...prev,
      photo: "",
    }));

    setPhotoChanged(true);

    setMessage(
      "Profile photo removed. Click Save Changes to save the change."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  // ================= INITIAL =================
  const getInitial = () => {
    return (
      profile.name
        ?.charAt(0)
        ?.toUpperCase() ||
      "A"
    );
  };

  // ================= DATE =================
  const formatDob = () => {
    if (!profile.dob) {
      return "Not provided";
    }

    const date =
      new Date(profile.dob);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not provided";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ================= FITNESS DATA =================
  const workoutCount =
    getStoredArray(
      "fittrackWorkouts"
    ).length;

  const progressCount =
    getStoredArray(
      "fittrackProgress"
    ).length;

  const goalCount =
    getStoredArray(
      "fittrackGoals"
    ).length;

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-message">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* ================= HEADER ================= */}
      <div className="profile-header">

        <div>
          <span className="profile-eyebrow">
            <FaUser /> MY ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your personal information and fitness profile.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            className="edit-profile-btn"
            onClick={handleEdit}
          >
            <FaEdit />
            Edit Profile
          </button>
        ) : (
          <div className="profile-header-actions">

            <button
              type="button"
              className="cancel-profile-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="button"
              className="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave />
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        )}

      </div>

      {/* ================= MESSAGE ================= */}
      {message && (
        <div className="profile-message">
          {message}
        </div>
      )}

      {/* ================= PROFILE HERO ================= */}
      <div className="profile-hero-card">

        <div className="profile-photo-wrapper">

          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`${profile.name} profile`}
              className="profile-photo"
            />
          ) : (
            <div className="profile-photo-placeholder">
              {getInitial()}
            </div>
          )}

          {editing && (
            <label className="photo-upload-btn">
              <FaCamera />

              <input
                type="file"
                accept="image/*"
                onChange={
                  handlePhotoChange
                }
                disabled={saving}
              />
            </label>
          )}

        </div>

        <div className="profile-hero-info">

          <h2>{profile.name}</h2>

          <p>{profile.email}</p>

          <div className="profile-member-badge">
            FitTrack Member
          </div>

        </div>

        {editing &&
          profile.photo && (
            <button
              type="button"
              className="remove-photo-btn"
              onClick={removePhoto}
              disabled={saving}
            >
              Remove Photo
            </button>
          )}

      </div>

      {/* ================= CONTENT GRID ================= */}
      <div className="profile-content-grid">

        {/* ================= PERSONAL INFORMATION ================= */}
        <div className="profile-card">

          <div className="profile-card-heading">

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Your basic account information.
              </p>
            </div>

            <FaUser />

          </div>

          {editing ? (
            <form
              className="profile-form"
              onSubmit={handleSave}
            >

              <div className="profile-form-grid">

                <div className="profile-form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your name"
                    required
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your email"
                    required
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={
                      handleChange
                    }
                    placeholder="Enter phone number"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Prefer not to say
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>

                </div>

                <div className="profile-form-group">

                  <label>
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Height (cm)
                  </label>

                  <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 178"
                    min="1"
                  />

                </div>

                <div className="profile-form-group full">

                  <label>
                    Bio
                  </label>

                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="Tell us a little about yourself..."
                  />

                </div>

              </div>

            </form>
          ) : (
            <div className="profile-info-grid">

              <div className="profile-info-item">

                <div className="info-icon">
                  <FaUser />
                </div>

                <div>
                  <span>
                    Full Name
                  </span>

                  <strong>
                    {profile.name}
                  </strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="info-icon">
                  <FaEnvelope />
                </div>

                <div>
                  <span>
                    Email Address
                  </span>

                  <strong>
                    {profile.email}
                  </strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="info-icon">
                  <FaPhone />
                </div>

                <div>
                  <span>
                    Phone Number
                  </span>

                  <strong>
                    {profile.phone ||
                      "Not provided"}
                  </strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="info-icon">
                  <FaVenusMars />
                </div>

                <div>
                  <span>
                    Gender
                  </span>

                  <strong>
                    {profile.gender
                      ? profile.gender
                          .charAt(0)
                          .toUpperCase() +
                        profile.gender.slice(
                          1
                        )
                      : "Not provided"}
                  </strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="info-icon">
                  <FaBirthdayCake />
                </div>

                <div>
                  <span>
                    Date of Birth
                  </span>

                  <strong>
                    {formatDob()}
                  </strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="info-icon">
                  <FaRulerVertical />
                </div>

                <div>
                  <span>
                    Height
                  </span>

                  <strong>
                    {profile.height
                      ? `${profile.height} cm`
                      : "Not provided"}
                  </strong>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ================= FITNESS OVERVIEW ================= */}
        <div className="profile-card">

          <div className="profile-card-heading">

            <div>
              <h2>
                Fitness Overview
              </h2>

              <p>
                Your FitTrack activity summary.
              </p>
            </div>

            <FaChartLine />

          </div>

          <div className="fitness-overview-list">

            <div className="fitness-overview-item">

              <div className="fitness-overview-icon workout">
                <FaDumbbell />
              </div>

              <div>
                <span>
                  Workouts
                </span>

                <strong>
                  {workoutCount}
                </strong>
              </div>

            </div>

            <div className="fitness-overview-item">

              <div className="fitness-overview-icon progress">
                <FaChartLine />
              </div>

              <div>
                <span>
                  Progress Records
                </span>

                <strong>
                  {progressCount}
                </strong>
              </div>

            </div>

            <div className="fitness-overview-item">

              <div className="fitness-overview-icon goals">
                <FaBullseye />
              </div>

              <div>
                <span>
                  Goals
                </span>

                <strong>
                  {goalCount}
                </strong>
              </div>

            </div>

          </div>

          <div className="profile-tip">

            <strong>
              💡 Fitness Tip
            </strong>

            <p>
              Consistency is more important than perfection.
              Keep tracking your workouts and progress regularly.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;