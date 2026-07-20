// TODO: Implement page header component

const PageHeader = ({ title, children }) => {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {children && <div className="page-header__actions">{children}</div>}
    </div>
  );
};

export default PageHeader;
