import styles from "./styles/Modal.module.scss";

interface ModalLayoutProps {
  children: React.ReactNode;
  isShow: boolean;
  onClose: (modalShow: boolean) => void;
}

const Modal: React.FC<ModalLayoutProps> = ({
  children,
  isShow,
  onClose,
}) => {
  //currentTargetのElmentをclickした際のみ閉じる
  const onClickAreaHandler = (
    e: React.MouseEvent<HTMLElement>,
    setModalShow: (modalShow: boolean) => void
  ) => {
    if (e.target === e.currentTarget) {
      setModalShow(false);  
    }
  };

  return isShow ? (
    <div className={styles.modalWrapper}>
      <div
        className={styles.overlay}
        onClick={(e) => onClickAreaHandler(e, onClose)}
      >
        <div className={styles.content}>
          {children}
          <button
            className={styles.closeBtn}
            onClick={(e) => onClickAreaHandler(e, onClose)}
          >
          </button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Modal;