/**
 * Anime Mapping Page
 *
 * This page allows users to:
 * - View their MyAnimeList anime library from local database
 * - Map each anime to corresponding AniDB IDs using the offline database
 * - Confirm suggested mappings or provide manual AniDB IDs
 * - Track mapping progress and statistics
 *
 * Features:
 * - Display user's anime list with mapping status
 * - Integration with anime-offline-database from manami-project
 * - Interactive mapping confirmation workflow
 * - Search and filter functionality
 * - Database status monitoring
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Layout from "@/components/layout";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import AnimeMappingModal from "@/components/anime-mapping-modal";
import Loader from "@/components/loader";

export default function AnimeMappingPage() {
  const { data: session, status } = useSession();

  // State management
  const [animeList, setAnimeList] = useState([]);
  const [filteredAnimeList, setFilteredAnimeList] = useState([]);
  const [mappings, setMappings] = useState({});
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchData, setSearchData] = useState(null);

  // Modal state
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapping process state
  const [isMapping, setIsMapping] = useState(false);
  const [mappingQueue, setMappingQueue] = useState([]);
  const [currentMappingIndex, setCurrentMappingIndex] = useState(0);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mappingFilter, setMappingFilter] = useState("all"); // all, mapped, unmapped
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  /**
   * Load initial data when component mounts
   */
  useEffect(() => {
    if (status === "authenticated") {
      loadInitialData();
    }
  }, [status]);

  /**
   * Filter and sort anime list when filters change
   */
  useEffect(() => {
    filterAndSortAnimeList();
  }, [animeList, searchTerm, statusFilter, mappingFilter, sortBy, sortOrder]);

  /**
   * Load anime list and database status
   */
  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load data in parallel
      const [animeResponse, statusResponse] = await Promise.all([
        loadAnimeList(),
        loadDatabaseStatus(),
      ]);

      if (animeResponse) {
        await loadExistingMappings(animeResponse);
      }
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load user's anime list from local database
   */
  const loadAnimeList = async () => {
    try {
      const response = await axios.get("/api/anime/list", {
        params: {
          limit: 1000, // Load all anime for mapping
          includeExternalIds: true,
          status: "watching,completed,on_hold,dropped,plan_to_watch",
        },
      });

      if (response.data.success) {
        const animeData = response.data.data
          .map((anime) => ({
            malId: anime.malId,
            title: anime.title,
            mediaType: anime.media_type,
            status: anime.status,
            numEpisodes: anime.num_episodes,
            userStatus: anime.userStatus?.status || "unknown",
            genres: anime.genres || [],
            startSeason: anime.start_season,
            externalIds: anime.externalIds || {},
          }))
          .filter((anime) => anime.malId); // Only show anime with MAL IDs

        setAnimeList(animeData);
        return animeData;
      } else {
        throw new Error(response.data.message || "Failed to load anime list");
      }
    } catch (err) {
      console.error("Error loading anime list:", err);
      throw err;
    }
  };

  /**
   * Load database status information
   */
  const loadDatabaseStatus = async () => {
    try {
      const response = await axios.get("/api/anime/db-status");

      if (response.data.success) {
        setDatabaseStatus(response.data.status);
        return response.data.status;
      }
    } catch (err) {
      console.error("Error loading database status:", err);
      // Don't throw error, just log it
    }
  };

  /**
   * Load existing mappings for the anime list
   */
  const loadExistingMappings = async (animeData) => {
    const mappingPromises = animeData.map(async (anime) => {
      try {
        const response = await axios.get(
          `/api/anime/mapping?malId=${anime.malId}`
        );
        if (response.data.success) {
          return { malId: anime.malId, mapping: response.data.mapping };
        }
      } catch (err) {
        // Mapping not found - this is normal
        return { malId: anime.malId, mapping: null };
      }
    });

    const mappingResults = await Promise.all(mappingPromises);
    const mappingMap = {};

    mappingResults.forEach((result) => {
      mappingMap[result.malId] = result.mapping;
    });

    setMappings(mappingMap);
  };

  /**
   * Filter and sort the anime list based on current filters
   */
  const filterAndSortAnimeList = () => {
    let filtered = [...animeList];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (anime) =>
          anime.title.toLowerCase().includes(term) ||
          anime.genres.some((genre) => genre.name?.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((anime) => anime.userStatus === statusFilter);
    }

    // Apply mapping filter
    if (mappingFilter !== "all") {
      if (mappingFilter === "mapped") {
        filtered = filtered.filter((anime) => mappings[anime.malId]);
      } else if (mappingFilter === "unmapped") {
        filtered = filtered.filter((anime) => !mappings[anime.malId]);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.userStatus.localeCompare(b.userStatus);
          break;
        case "episodes":
          comparison = (a.numEpisodes || 0) - (b.numEpisodes || 0);
          break;
        case "mapping_status":
          const aMapped = !!mappings[a.malId];
          const bMapped = !!mappings[b.malId];
          comparison = aMapped === bMapped ? 0 : aMapped ? 1 : -1;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredAnimeList(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  /**
   * Start the mapping process for unmapped anime
   */
  const handleStartMapping = () => {
    const unmapped = animeList.filter((anime) => !mappings[anime.malId]);
    if (unmapped.length === 0) {
      alert("All anime are already mapped!");
      return;
    }

    setMappingQueue(unmapped);
    setCurrentMappingIndex(0);
    setIsMapping(true);
    handleMapAnime(unmapped[0]);
  };

  /**
   * Move to the next anime in the mapping queue
   */
  const handleNextInQueue = () => {
    const nextIndex = currentMappingIndex + 1;
    if (nextIndex < mappingQueue.length) {
      setCurrentMappingIndex(nextIndex);
      handleMapAnime(mappingQueue[nextIndex]);
    } else {
      // End of queue
      setIsMapping(false);
      setMappingQueue([]);
      setIsModalOpen(false);
      alert("Mapping complete!");
    }
  };

  /**
   * Open mapping modal for selected anime
   */
  const handleMapAnime = (anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  /**
   * Handle successful mapping confirmation
   */
  const handleMappingConfirmed = (mapping) => {
    setMappings((prev) => ({
      ...prev,
      [mapping.malId]: mapping,
    }));

    if (isMapping) {
      handleNextInQueue();
    } else {
      setIsModalOpen(false);
    }
  };

  const handleModalClosed = () => {
    if (isMapping) {
      handleNextInQueue();
    }
    setIsModalOpen(false);
  };

  /**
   * Update offline database
   */
  const handleUpdateDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/anime/update-offline-db");
      if (response.data.success) {
        await loadDatabaseStatus();
        alert("Database updated successfully!");
      } else {
        alert("Failed to update database: " + response.data.message);
      }
    } catch (err) {
      console.error("Error updating database:", err);
      alert("Failed to update database. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get pagination info
   */
  const getPaginationInfo = () => {
    const totalItems = filteredAnimeList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredAnimeList.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  };

  const pagination = getPaginationInfo();

  // Show loader while loading
  if (isLoading && status === "loading") {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    return (
      <Layout titleName="Anime Mapping - Login Required">
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <h2>Authentication Required</h2>
            <p>Please log in to access the anime mapping feature.</p>
            <a href="/login" className="btn btn-primary">
              Login
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout titleName="Anime Mapping">
      <Header malAccessToken={session?.malAccessToken} setSearchData={setSearchData} />
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <main id="main" className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            {/* Page Header */}
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">
                <i className="bi bi-diagram-3 me-2"></i>
                Anime Mapping
              </h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <button
                  className="btn btn-primary"
                  onClick={handleStartMapping}
                  disabled={isMapping || isLoading}
                >
                  {isMapping ? 'Mapping in Progress...' : 'Start Mapping'}
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  onClick={handleUpdateDatabase}
                  disabled={isLoading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Update Offline DB
                </button>
              </div>
            </div>

            {isModalOpen && (
              <AnimeMappingModal
                anime={selectedAnime}
                isOpen={isModalOpen}
                onClose={handleModalClosed}
                onConfirm={handleMappingConfirmed}
              />
            )}

            {/* Database Status */}
            {databaseStatus && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-database me-2"></i>
                    Offline Database Status
                  </h5>
                  <div className="row">
                    <div className="col-md-3">
                      <strong>Last Updated:</strong>
                      <br />
                      {databaseStatus.lastUpdated
                        ? new Date(databaseStatus.lastUpdated).toLocaleString()
                        : "Never"}
                    </div>
                    <div className="col-md-3">
                      <strong>Status:</strong>
                      <br />
                      <span
                        className={`badge ${
                          databaseStatus.downloadStatus === "success"
                            ? "bg-success"
                            : databaseStatus.downloadStatus === "failed"
                            ? "bg-danger"
                            : "bg-warning"
                        }`}
                      >
                        {databaseStatus.downloadStatus}
                      </span>
                    </div>
                    <div className="col-md-3">
                      <strong>Total Mappings:</strong>
                      <br />
                      {databaseStatus.totalMappings?.toLocaleString() || 0}
                    </div>
                    <div className="col-md-3">
                      <strong>Confirmed:</strong>
                      <br />
                      {databaseStatus.confirmedMappings?.toLocaleString() || 0}
                    </div>
                  </div>
                  {databaseStatus.needsUpdate && (
                    <div className="alert alert-warning mt-3 mb-0">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Database hasn't been updated in over 7 days. Consider
                      updating it.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Search Anime</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by title or genre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Watch Status</label>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="dropped">Dropped</option>
                      <option value="plan_to_watch">Plan to Watch</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Mapping Status</label>
                    <select
                      className="form-select"
                      value={mappingFilter}
                      onChange={(e) => setMappingFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="mapped">Mapped</option>
                      <option value="unmapped">Unmapped</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Sort By</label>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="title">Title</option>
                      <option value="status">Status</option>
                      <option value="episodes">Episodes</option>
                      <option value="mapping_status">Mapping Status</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Order</label>
                    <select
                      className="form-select"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading anime list...</p>
              </div>
            )}

            {/* Anime List */}
            {!isLoading && !error && (
              <>
                {/* Summary */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <strong>
                      Showing {pagination.startIndex + 1}-{pagination.endIndex}{" "}
                      of {pagination.totalItems} anime
                    </strong>
                    {searchTerm && (
                      <span className="text-muted ms-2">
                        (filtered by "{searchTerm}")
                      </span>
                    )}
                  </div>
                  <div className="text-muted">
                    Mapped:{" "}
                    {
                      Object.keys(mappings).filter((key) => mappings[key])
                        .length
                    }{" "}
                    / {animeList.length}
                  </div>
                </div>

                {/* Anime Table */}
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>MAL ID</th>
                        <th>Type</th>
                        <th>Episodes</th>
                        <th>Watch Status</th>
                        <th>Mapping Status</th>
                        <th>AniDB ID</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagination.currentItems.map((anime) => {
                        const mapping = mappings[anime.malId];
                        const isMapped = !!mapping;

                        return (
                          <tr key={anime.malId}>
                            <td>
                              <div>
                                <strong>{anime.title}</strong>
                                {anime.startSeason && (
                                  <div className="text-muted small">
                                    {anime.startSeason.season}{" "}
                                    {anime.startSeason.year}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{anime.malId}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {anime.mediaType}
                              </span>
                            </td>
                            <td>{anime.numEpisodes || "?"}</td>
                            <td>
                              <span
                                className={`badge ${
                                  anime.userStatus === "completed"
                                    ? "bg-success"
                                    : anime.userStatus === "watching"
                                    ? "bg-primary"
                                    : anime.userStatus === "on_hold"
                                    ? "bg-warning"
                                    : anime.userStatus === "dropped"
                                    ? "bg-danger"
                                    : "bg-info"
                                }`}
                              >
                                {anime.userStatus?.replace("_", " ")}
                              </span>
                            </td>
                            <td>
                              {isMapped ? (
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Mapped
                                </span>
                              ) : (
                                <span className="badge bg-warning">
                                  <i className="bi bi-question-circle me-1"></i>
                                  Unmapped
                                </span>
                              )}
                            </td>
                            <td>
                              {mapping ? (
                                <div>
                                  <strong>{mapping.anidbId}</strong>
                                  {mapping.isConfirmed && (
                                    <i
                                      className="bi bi-shield-check text-success ms-1"
                                      title="User confirmed"
                                    ></i>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <button
                                className={`btn btn-sm ${
                                  isMapped
                                    ? "btn-outline-primary"
                                    : "btn-primary"
                                }`}
                                onClick={() => handleMapAnime(anime)}
                              >
                                <i className="bi bi-diagram-3 me-1"></i>
                                {isMapped ? "Update" : "Map"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <nav aria-label="Anime list pagination">
                    <ul className="pagination justify-content-center">
                      <li
                        className={`page-item ${
                          !pagination.hasPrevPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                        >
                          Previous
                        </button>
                      </li>

                      {/* Page numbers */}
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const pageNum = Math.max(1, currentPage - 2) + i;
                          if (pageNum <= pagination.totalPages) {
                            return (
                              <li
                                key={pageNum}
                                className={`page-item ${
                                  currentPage === pageNum ? "active" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          }
                          return null;
                        }
                      )}

                      <li
                        className={`page-item ${
                          !pagination.hasNextPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}

                {/* Empty State */}
                {pagination.totalItems === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h3 className="mt-3">No Anime Found</h3>
                    <p className="text-muted">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      mappingFilter !== "all"
                        ? "Try adjusting your filters to see more results."
                        : "Your anime list appears to be empty. Make sure you have synced your MyAnimeList data."}
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
