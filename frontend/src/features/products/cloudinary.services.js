
const CLOUD_NAME = "eekbm8b7";
const UPLOAD_PRESET = "products_img";

export async function uploadProductImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing.");
  }

  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "brew-desk/products");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Image upload failed."
    );
  }

  return result.secure_url;
}