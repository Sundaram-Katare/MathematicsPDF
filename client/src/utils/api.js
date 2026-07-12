const API_URL = `${import.meta.env.VITE_API_URL}/api/extract`;

export const extractQuestions = async (formData) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Failed to extract questions");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};
