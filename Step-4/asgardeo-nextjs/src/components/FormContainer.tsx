import React from 'react';

interface FormContainerProps {
    children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
    return (
        <div className='form-container'>
            {children}
        </div>
    );
};

export default FormContainer;