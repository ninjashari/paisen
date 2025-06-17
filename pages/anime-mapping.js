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
import DbAnimeTable from "@/components/db-anime-table";

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
  }, [animeList, searchTerm, statusFilter, mappingFilter]);

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
            anidbId: anime.anidbId,
            title: anime.title,
            englishTitle: anime.englishTitle,
            mediaType: anime.media_type,
            status: anime.status,
            score: anime.score,
            episodes: anime.episodes,
            year: anime.year,
            updatedAt: anime.updatedAt,
            createdAt: anime.createdAt,
            userStatus: anime.userStatus?.status || "unknown",
            genres: anime.genres || [],
            studios: anime.studios || [],
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
      filtered = filtered.filter(
        (anime) => anime.userStatus === statusFilter
      );
    }

    // Apply mapping filter
    if (mappingFilter !== "all") {
      if (mappingFilter === "mapped") {
        filtered = filtered.filter((anime) => mappings[anime.malId]);
      } else if (mappingFilter === "unmapped") {
        filtered = filtered.filter((anime) => !mappings[anime.malId]);
      }
    }
    
    setFilteredAnimeList(filtered);
  };

  /**
   * Handle mapping button click
   */
  const handleMapAnime = (anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  /**
   * Handle modal confirmed event
   */
  const handleMappingConfirmed = (mapping) => {
    setMappings((prev) => ({ ...prev, [mapping.malId]: mapping }));
  };

  /**
   * Handle modal closed event
   */
  const handleModalClosed = () => {
    setIsModalOpen(false);
    setSelectedAnime(null);
  };

  /**
   * Handle offline database update
   */
  const handleUpdateDatabase = async () => {
    try {
      await axios.post("/api/anime/update-offline-db");
      // Reload status after update
      await loadDatabaseStatus();
    } catch (err) {
      console.error("Error updating offline database:", err);
      alert("Failed to update database.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Header />
        <Sidebar currentPage="anime-mapping" />
        <main id="main" className="main">
          <div className="pagetitle">
            <h1>Anime Mapping</h1>
          </div>
          <Loader />
        </main>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Header />
        <Sidebar currentPage="anime-mapping" />
        <main id="main" className="main">
          <div className="pagetitle">
            <h1>Anime Mapping</h1>
          </div>
          <div className="alert alert-danger">{error}</div>
        </main>
      </Layout>
    );
  }

  const mappingStats = {
    total: animeList.length,
    mapped: Object.values(mappings).filter(Boolean).length,
  };

  return (
    <Layout>
      <Header />
      <Sidebar currentPage="anime-mapping" />
      <main id="main" className="main">
        {/* Page Title and Actions */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="pagetitle">
            <h1>Anime Mapping</h1>
            <p>Map your local anime library to AniDB for enhanced features.</p>
          </div>
        </div>

        {/* Modal for mapping */}
        {isModalOpen && (
          <AnimeMappingModal
            anime={selectedAnime}
            onClose={handleModalClosed}
            onMappingConfirmed={handleMappingConfirmed}
          />
        )}

        {/* Database and Mapping Stats */}
        <div className="row">
          {/* Mapping Progress */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Mapping Progress</h5>
                <p>
                  {mappingStats.mapped} of {mappingStats.total} anime mapped (
                  {((mappingStats.mapped / mappingStats.total) * 100).toFixed(2)}
                  %)
                </p>
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${
                        (mappingStats.mapped / mappingStats.total) * 100
                      }%`,
                    }}
                    aria-valuenow={mappingStats.mapped}
                    aria-valuemin="0"
                    aria-valuemax={mappingStats.total}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          {/* Offline Database Status */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Offline Database Status</h5>
                {databaseStatus ? (
                  <>
                    <p className="mb-1">
                      <strong>Status:</strong> {databaseStatus.downloadStatus}
                    </p>
                    <p className="mb-1">
                      <strong>Last Updated:</strong>{" "}
                      {new Date(
                        databaseStatus.lastDownloadedAt
                      ).toLocaleDateString()}
                    </p>
                    <p className="mb-0">
                      <strong>Total Mappings:</strong>{" "}
                      {databaseStatus.totalMappings}
                    </p>
                  </>
                ) : (
                  <p>Loading status...</p>
                )}
                <button
                  className="btn btn-sm btn-primary mt-2"
                  onClick={handleUpdateDatabase}
                >
                  Update Database
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Filters</h5>
            <div className="row">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Watch Status</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                  <option value="plan_to_watch">Plan to Watch</option>
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={mappingFilter}
                  onChange={(e) => setMappingFilter(e.target.value)}
                >
                  <option value="all">All Mapping Status</option>
                  <option value="mapped">Mapped</option>
                  <option value="unmapped">Unmapped</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Anime List Table */}
        <DbAnimeTable animeList={filteredAnimeList} loading={isLoading} />
      </main>
    </Layout>
  );
}
