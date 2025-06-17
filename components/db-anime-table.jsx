/**
 * Database Anime Table Component
 * 
 * This component renders a read-only table for displaying anime data fetched
 * from the local MongoDB database. It supports sorting and pagination and is
 * designed to be used on pages like the Anime Library and Anime Mapping.
 */
import { useState, useEffect } from 'react';

const DbAnimeTable = ({ animeList, loading }) => {
  const [filteredAnime, setFilteredAnime] = useState([]);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  /**
   * Applies sorting to the anime list
   */
  const applySorting = () => {
    let sorted = [...animeList];

    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'episodes':
          aValue = a.episodes || 0;
          bValue = b.episodes || 0;
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'updated':
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });

    setFilteredAnime(sorted);
    setCurrentPage(1);
  };

  useEffect(() => {
    applySorting();
  }, [sortBy, sortOrder, animeList]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key) => {
    if (sortBy !== key) return null;
    return sortOrder === 'asc' ? '▲' : '▼';
  };
  
  const getPaginatedAnime = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredAnime.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredAnime.length / itemsPerPage);

    return {
      items: paginatedItems,
      totalPages,
      currentPage,
      totalItems: filteredAnime.length,
    };
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'watching': return 'bg-primary';
      case 'plan_to_watch': return 'bg-info';
      case 'dropped': return 'bg-danger';
      case 'on_hold': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'watching': return 'Watching';
      case 'plan_to_watch': return 'Plan to Watch';
      case 'dropped': return 'Dropped';
      case 'on_hold': return 'On Hold';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  const paginatedData = getPaginatedAnime();

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-list me-2"></i>
          Anime Collection ({paginatedData.totalItems} entries)
        </h5>
        {paginatedData.totalPages > 1 && (
          <small className="text-muted">
            Page {paginatedData.currentPage} of {paginatedData.totalPages}
          </small>
        )}
      </div>
      <div className="card-body">
        {paginatedData.totalItems === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-collection display-1 text-muted"></i>
            <h4 className="mt-3">No Anime Found</h4>
            <p className="text-muted">
              Your anime library is empty or no results match your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col" onClick={() => handleSort('title')}>Title {getSortIcon('title')}</th>
                    <th scope="col">Genres</th>
                    <th scope="col">Studios</th>
                    <th scope="col">Status</th>
                    <th scope="col" onClick={() => handleSort('score')}>Score {getSortIcon('score')}</th>
                    <th scope="col" onClick={() => handleSort('episodes')}>Episodes {getSortIcon('episodes')}</th>
                    <th scope="col" onClick={() => handleSort('year')}>Year {getSortIcon('year')}</th>
                    <th scope="col" onClick={() => handleSort('updated')}>Last Updated {getSortIcon('updated')}</th>
                    <th scope="col">MAL ID</th>
                    <th scope="col">AniDB ID</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.items.map((anime, index) => (
                    <tr key={anime._id || anime.malId || index}>
                      <td>
                        <div>
                          <strong>{anime.title}</strong>
                          {anime.englishTitle && anime.englishTitle !== anime.title && (
                            <small className="text-muted d-block">{anime.englishTitle}</small>
                          )}
                        </div>
                      </td>
                      <td className="small">{anime.genres?.map(genre => genre.name).join(', ')}</td>
                      <td className="small">{anime.studios?.map(studio => studio.name).join(', ')}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(anime.status)}`}>
                          {getStatusText(anime.status)}
                        </span>
                      </td>
                      <td>
                        <div className="text-center">
                          {anime.score ? (
                            <span className="badge bg-warning text-dark">{anime.score}/10</span>
                          ) : (
                            <span className="text-muted">Not Rated</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-center">
                          <span className="badge bg-primary">{anime.episodes || 'Unknown'}</span>
                          {anime.watchedEpisodes !== undefined && (
                            <small className="text-muted d-block">{anime.watchedEpisodes} watched</small>
                          )}
                        </div>
                      </td>
                      <td>{anime.year || 'Unknown'}</td>
                      <td>
                        <small className="text-muted">{formatDate(anime.updatedAt || anime.createdAt)}</small>
                      </td>
                      <td>{anime.malId || 'N/A'}</td>
                      <td>{anime.anidbId || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedData.totalPages > 1 && (
              <nav aria-label="Anime library pagination">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                      Previous
                    </button>
                  </li>
                  {[...Array(paginatedData.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    const showPage = page === 1 || page === paginatedData.totalPages || Math.abs(page - currentPage) <= 2;
                    if (!showPage && page !== currentPage - 3 && page !== currentPage + 3) return null;
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                    }
                    return (
                      <li key={page} className={`page-item ${isCurrentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                      </li>
                    );
                  })}
                  <li className={`page-item ${currentPage === paginatedData.totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginatedData.totalPages}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DbAnimeTable; 