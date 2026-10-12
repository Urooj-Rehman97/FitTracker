const API_BASE_URL =  "https://fittracker-4ifk.onrender.com/api";

// ==================================================
// BASE API REQUEST
// ==================================================

const apiRequest = async (
  endpoint,
  options = {}
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        cache:
          options.cache || "no-store",
        headers: {
          "Content-Type":
            "application/json",
          ...(options.headers || {}),
        },
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `API request failed (${response.status})`
      );
    }

    return data;
  } catch (error) {
    console.error(
      `API Error [${endpoint}]:`,
      error
    );

    if (
      error instanceof TypeError &&
      error.message === "Failed to fetch"
    ) {
      throw new Error(
        "Cannot connect to the server. Make sure the backend is running on http://localhost:3000."
      );
    }

    throw error;
  }
};

// ==================================================
// AUTHENTICATION
// ==================================================

export const registerUser = async (
  userData
) => {
  return apiRequest(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(userData),
    }
  );
};

export const loginUser = async (
  loginData
) => {
  return apiRequest(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(loginData),
    }
  );
};

export const getCurrentUser = async (
  token
) => {
  return apiRequest(
    "/auth/me",
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};

// ==================================================
// TOKEN
// ==================================================

export const getToken = () => {
  return (
    sessionStorage.getItem(
      "fittrackToken"
    ) ||
    localStorage.getItem(
      "fittrackToken"
    )
  );
};

export const getAuthHeaders = () => {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization:
      `Bearer ${token}`,
  };
};

// ==================================================
// AUTHENTICATED REQUEST
// ==================================================

export const authRequest = async (
  endpoint,
  options = {}
) => {
  return apiRequest(
    endpoint,
    {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    }
  );
};

// ==================================================
// LOGOUT
// ==================================================

export const logoutUser = () => {
  sessionStorage.removeItem(
    "fittrackToken"
  );

  sessionStorage.removeItem(
    "fittrackUser"
  );

  localStorage.removeItem(
    "fittrackToken"
  );

  localStorage.removeItem(
    "fittrackUser"
  );

  localStorage.removeItem(
    "fittrackProfile"
  );

  localStorage.removeItem(
    "fittrackSettings"
  );
};

// ==================================================
// PUBLIC WEBSITE CONTENT
// ==================================================

export const getPublicPageContent =
  async (page) => {
    return apiRequest(
      `/public/${page}`
    );
  };

// ==================================================
// ADMIN WEBSITE CONTENT
// ==================================================

export const getAdminPublicContent =
  async () => {
    return authRequest(
      "/admin/public-content"
    );
  };

export const updateAdminPublicPage =
  async (
    page,
    content,
    isPublished = true
  ) => {
    return authRequest(
      `/admin/public-content/${page}`,
      {
        method: "PUT",
        body: JSON.stringify({
          content,
          isPublished,
        }),
      }
    );
  };

export const resetAdminPublicPage =
  async (page) => {
    return authRequest(
      `/admin/public-content/${page}/reset`,
      {
        method: "PUT",
      }
    );
  };

// ==================================================
// CONTACT
// ==================================================

export const createContactMessage =
  async (messageData) => {
    return apiRequest(
      "/contact",
      {
        method: "POST",
        body: JSON.stringify(
          messageData
        ),
      }
    );
  };

export const getContactMessages =
  async () => {
    return authRequest("/contact");
  };

export const getContactMessage =
  async (id) => {
    return authRequest(
      `/contact/${id}`
    );
  };

export const updateContactMessage =
  async (id, data) => {
    return authRequest(
      `/contact/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  };

export const deleteContactMessage =
  async (id) => {
    return authRequest(
      `/contact/${id}`,
      {
        method: "DELETE",
      }
    );
  };

// ==================================================
// DEFAULT
// ==================================================

export default apiRequest;