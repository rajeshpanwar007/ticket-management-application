// TODO: Implement login page (stretch)

const LoginPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call login API
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
