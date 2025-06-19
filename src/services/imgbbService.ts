import axios from 'axios';

const IMGBB_API_KEY = 'd0ce2e8d3a4d923876e7f845e587dc82';

export const uploadToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );
    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw new Error('ছবি আপলোড করতে সমস্যা হয়েছে');
  }
};