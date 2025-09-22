import Swal, { SweetAlertIcon } from "sweetalert2";
import './styles.css'

export const showNotification = (title: string, text: string, icon: SweetAlertIcon = "info") => {
  Swal.fire({
    title,
    text,
    icon,
    toast: true, // important
    position: "top-end",
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup: "custom-swal-popup",
    },
  });
  
};

