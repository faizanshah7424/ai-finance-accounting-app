import { NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorPageProps) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{statusCode ? `An error ${statusCode} occurred` : 'An error occurred'}</h1>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
