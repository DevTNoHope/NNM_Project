import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getProjects } from "@/api/projectApi";
import { filterProjects } from "@/utils/filterProjects";
import SearchBar from "@/components/common/SearchBar";
import ProjectFilters from "@/components/project/ProjectFilters";
import ProjectGrid from "@/components/project/ProjectGrid";
import EmptyState from "@/components/common/EmptyState";
import Spinner from "@/components/common/Spinner";
import Button from "@/components/common/Button";
import "./ProjectsPage.css";

const PAGE_SIZE = 6;

const ProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: initialSearch,
    status: 'All',
    category: 'All',
    sort: 'newest'
  });

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setFilters(f => ({ ...f, search: urlSearch }));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      try {
        setLoading(true);
        const params = filters.search.trim() ? { search: filters.search.trim() } : {};
        const r = await getProjects(params);
        if (active) {
          setAll(r?.data?.data || r?.data || []);
        }
      } catch (error) {
        if (active) {
          console.error('Load projects failed:', error);
          setAll([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadProjects();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters.search]);

  const filtered = useMemo(() => filterProjects(all, filters), [all, filters]);
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const handleFilters = (f) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="projects-page">
      <div className="projects-hero">
        <div className="container">
          <h1 className="projects-hero__title">Discover Projects</h1>
          <p className="projects-hero__sub">
            Support verified, impactful causes from around the world.
          </p>
          <SearchBar
            value={filters.search}
            onChange={(val) => handleFilters({ ...filters, search: val })}
            placeholder="Search projects, organizations, tags..."
            className="projects-hero__search"
          />
        </div>
      </div>

      <div className="projects-body container">
        {loading ? (
          <Spinner center size="lg" />
        ) : (
          <>
            <ProjectFilters
              filters={filters}
              onChange={handleFilters}
              resultCount={filtered.length}
            />

            {filtered.length === 0 ? (
              <EmptyState
                title="No projects found"
                description="Try adjusting your search or filters."
              />
            ) : (
              <>
                <ProjectGrid projects={paginated} />
                {hasMore && (
                  <div className="projects-load-more">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Load More ({filtered.length - paginated.length} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
