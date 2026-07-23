import toast from 'react-hot-toast';

// Track shown toasts to prevent duplicates
const shownToasts = new Set();
const toastTimeout = 3000;

export const showToast = (message, type = 'success', id = null) => {
  const toastId = id || message;
  
  if (shownToasts.has(toastId)) {
    return;
  }
  
  shownToasts.add(toastId);
  
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else if (type === 'loading') {
    toast.loading(message);
  } else {
    toast(message);
  }
  
  setTimeout(() => {
    shownToasts.delete(toastId);
  }, toastTimeout);
};

export const clearToastCache = () => {
  shownToasts.clear();
};

export default { showToast, clearToastCache };
