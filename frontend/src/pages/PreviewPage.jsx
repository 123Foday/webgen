import React, { useEffect, useState } from 'react'
import { previewPageStyles as s } from '../assets/dummyStyles';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Loader2, 
  Sparkles } from 'lucide-react';
import { FullScreenMessage, Logo } from '../assets/ui';
import { useAuth } from '../context/AuthContext';
import { apiError, getCommunityProject, getProject, likeCommunityProject } from '../utils/api';
import { safePreviewHtml } from '../utils/safePreview';

const PreviewPage = () => {
  const { id } = useParams();
  const { user } =useAuth();
  const [ project, setProject ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState("");
  const [ liking, setLiking ] = useState(false);

  // to load the previes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { project: p } = await getCommunityProject(id);
        if (!cancelled) setProject(p);
      } catch {
        if (user) {
          try {
            const { project: p } = await getProject(id);
            if (!cancelled) setProject(p);
          } catch (err) {
            if (!cancelled) setError(apiError(err));
          }
        } else if (!cancelled) {
          setError("This preview isn't public yet.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, user]);


  if (loading) {
    return (
      <FullScreenMessage>
        <Loader2 className={s.loadingSpinner} />
        Loading preview...
      </FullScreenMessage>
    );
  }
  if (error || !project) {
    return (
      <FullScreenMessage>
        <p className={s.errorTitle}>Preview unavailable</p>
        <p className={s.errorMessage}>
          {error || "Project not found"}
        </p>
        <Link
          to="/community"
          className={s.errorButton}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Browse community
        </Link>
      </FullScreenMessage>
    );
  }

  // to like the current project
  async function handleLike() {
    if (!project || liking) return;
    setLiking(true);
    try {
      const { likes } = await likeCommunityProject(project.id);
      setProject((p)=> ({ ...p, likes }))
    } catch {
      // ignore
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className={s.container}>
      <header className={s.header}>
        <Link to="/community" className={s.backLink}>
          <ArrowLeft className={s.backIcon} /> Community 
        </Link>

        <div className={s.logoWrapper}>
          <Logo />
        </div>

        <div className={s.projectInfo}>
          <p className={s.projectName}>{project.name}</p>
          <p className={s.projectAuthor}>by {project.author || "Anonymous"}</p>
        </div>

        <div className={s.actions}>
          {typeof project.views === "number" && (
            <span className={s.viewsBadge}>
              <Eye className={s.viewsIcon} /> {project.views}
            </span>
          )}

          <button onClick={handleLike} disabled={liking} className={s.likeButton}>
            <Heart className={s.likeIcon}  />
            {project.likes ?? 0}
          </button>
        </div>
      </header>
        <div className={s.previewArea}>
          {project.html ? (
            <iframe
              title={project.name} 
              srcDoc={safePreviewHtml(project.html)}
              sandbox="allow-scripts allow-same-origin allow-modals allow-popups" 
              className={s.iframe} />
          ) : (
            <div className={s.emptyContainer}>
              <Sparkles className={s.emptyIcon} />
              This project has no generated HTML yet
            </div>
          )}
        </div>
    </div>
  )
}

export default PreviewPage
