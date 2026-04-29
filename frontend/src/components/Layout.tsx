import { useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';

interface Props {
  children: React.ReactNode;
}

/**
 * Layout wraps every protected page.
 * It renders the Sidebar (fixed left) + Navbar (sticky top)
 * and shifts the main content area to the right of the sidebar.
 *
 * Usage in App.tsx:
 *   <ProtectedRoute>
 *     <Layout>
 *       <Shop />
 *     </Layout>
 *   </ProtectedRoute>
 */
export default function Layout({ children }: Props) {
  const location = useLocation();

  // Reset scroll position on every page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <style>{`
        .layout-root {
          display: flex;
          min-height: 100vh;
          background: #fffaf5;
        }

        /* Spacer that pushes content past the collapsed sidebar (64px) */
        .layout-spacer {
          flex-shrink: 0;
          width: 64px;
          transition: width 0.26s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Main area: navbar on top, then page content */
        .layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* prevent flex overflow */
        }

        .layout-content {
          flex: 1;
        }
      `}</style>

      <div className="layout-root">
        <Sidebar />

        {/* This div matches the sidebar's collapsed width so content doesn't slide under it */}
        <div className="layout-spacer" />

        <div className="layout-main">
          <Navbar />
          <div className="layout-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
