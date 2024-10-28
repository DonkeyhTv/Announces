import axios from "axios";
import { API_BASE_URL } from "./api";

export const fetchImages = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/gallery`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch images: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Fetched data is not an array");
  }

  return data;
};

export const uploadImages = async (
  userId: string,
  token: string,
  formData: FormData
) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/gallery`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Upload failed: ${response.statusText}, ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  if (!Array.isArray(data.files)) {
    throw new Error("Upload response does not contain files array");
  }

  return data.files;
};

export const deleteImage = async (
  userId: string,
  token: string,
  fileName: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/gallery/${encodeURIComponent(fileName)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Delete failed: ${response.statusText}, ${JSON.stringify(errorData)}`
    );
  }

  return response.json();
};

export const updateCoverImage = async (
  userId: string,
  token: string,
  fileName: string
) => {
  const encodedFileName = encodeURIComponent(fileName);
  const formData = new FormData();
  formData.append("cover", "true");

  const response = await axios.patch(
    `${API_BASE_URL}/user/${userId}/gallery/${encodedFileName}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(
      `Update cover failed: ${response.statusText}, ${JSON.stringify(
        response.data
      )}`
    );
  }

  return response.data;
};

export const updateImageStatus = async (
  userId: string,
  token: string,
  fileName: string,
  newStatus: number
) => {
  console.log(
    `Updating image status: userId=${userId}, fileName=${fileName}, newStatus=${newStatus}`
  );
  try {
    const response = await fetch(
      `${API_BASE_URL}/user/${userId}/gallery/${encodeURIComponent(fileName)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to update image status: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Update successful:", data);
    return data;
  } catch (error) {
    console.error("Error in updateImageStatus:", error);
    throw error;
  }
};
