import React from 'react';
import styles from './style.module.css';

interface EditProfileButtonProps {
    onClick: () => void;
}

export default function EditProfileButton({ onClick }: EditProfileButtonProps) {
    return (
        <button
            className={styles.editProfileButton}
            onClick={onClick}
        >
            Edit profile
        </button>
    );
}