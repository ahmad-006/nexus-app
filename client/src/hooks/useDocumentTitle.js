import { useEffect } from 'react';

const BASE_TITLE = 'NEXUS - Project Workspace & Engineering Workflow';

export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) {
      document.title = BASE_TITLE;
      return;
    }

    const fullTitle = `${title} | NEXUS`;
    const prevTitle = document.title;
    document.title = fullTitle;

    return () => {
      if (document.title === fullTitle) {
        document.title = prevTitle || BASE_TITLE;
      }
    };
  }, [title]);
}
