function ErrorMessage({ message }) {
  return (
    <div className="status-banner error-banner" role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;
