import React from 'react';

interface EditProfileButtonProps {
    onClick: () => void;
}

export default function EditProfileButton({ onClick }: EditProfileButtonProps) {
    return (
        <button 
            className="edit-button"
            onClick={onClick}
        >
            Edit Profile
        </button>
    );
}