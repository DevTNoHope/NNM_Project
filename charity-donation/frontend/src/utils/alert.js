import Swal from 'sweetalert2';

const defaultConfig = {
  customClass: {
    popup: 'swal-hopefund',
    confirmButton: 'swal-btn swal-btn-confirm',
    cancelButton: 'swal-btn swal-btn-cancel',
    denyButton: 'swal-btn swal-btn-deny',
  },
  buttonsStyling: false,
};

/**
 * Show a success alert
 */
export const alertSuccess = (title, text) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title: title || 'Success!',
    text,
    timer: 2000,
    showConfirmButton: false,
  });
};

/**
 * Show an error alert
 */
export const alertError = (title, text) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title: title || 'Error!',
    text,
  });
};

/**
 * Show a warning alert
 */
export const alertWarning = (title, text) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title: title || 'Warning',
    text,
  });
};

/**
 * Show an info alert
 */
export const alertInfo = (title, text) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'info',
    title: title || 'Info',
    text,
  });
};

/**
 * Show a confirmation dialog
 * @returns Promise<boolean> - true if confirmed, false if cancelled
 */
export const alertConfirm = async ({
  title = 'Are you sure?',
  text = '',
  confirmText = 'Yes',
  cancelText = 'Cancel',
  icon = 'warning',
  isDanger = false,
} = {}) => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      ...defaultConfig.customClass,
      confirmButton: isDanger
        ? 'swal-btn swal-btn-danger'
        : 'swal-btn swal-btn-confirm',
    },
  });
  return result.isConfirmed;
};

export default Swal;
