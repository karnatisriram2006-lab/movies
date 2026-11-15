import { useEffect, useMemo, useRef, useState } from "react";
import MovieCard from "./movieCard";

const OVERSCAN_ROWS = 3;
const ESTIMATED_CARD_RATIO = 1.5;

function VirtualizedMovieGrid({ movies, className = "movies-grid" }) {
  const gridRef = useRef(null);
  const [viewport, setViewport] = useState({ top: 0, height: 0 });
  const [layout, setLayout] = useState({ top: 0, columns: 1, rowHeight: 360, rowGap: 0 });

  useEffect(() => {
    let animationFrame = 0;
    const measureViewport = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const scrollTop = document.scrollingElement?.scrollTop || window.scrollY || document.body.scrollTop;
        setViewport({ top: scrollTop, height: window.innerHeight });
      });
    };

    measureViewport();
    window.addEventListener("scroll", measureViewport, { passive: true });
    document.addEventListener("scroll", measureViewport, { capture: true, passive: true });
    window.addEventListener("resize", measureViewport);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", measureViewport);
      document.removeEventListener("scroll", measureViewport, true);
      window.removeEventListener("resize", measureViewport);
    };
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;

    let animationFrame = 0;
    const measureGrid = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const style = window.getComputedStyle(grid);
        const columns = Math.max(1, style.gridTemplateColumns.split(" ").filter(Boolean).length);
        const rowGap = Number.parseFloat(style.rowGap) || 0;
        const firstCard = grid.querySelector(".movie-card");
        const cardHeight = firstCard?.getBoundingClientRect().height || (grid.clientWidth / columns) * ESTIMATED_CARD_RATIO;
        const scrollTop = document.scrollingElement?.scrollTop || window.scrollY || document.body.scrollTop;
        setLayout({
          top: grid.getBoundingClientRect().top + scrollTop,
          columns,
          rowHeight: cardHeight + rowGap,
          rowGap,
        });
      });
    };

    measureGrid();
    const resizeObserver = new ResizeObserver(measureGrid);
    resizeObserver.observe(grid);
    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [movies.length, className]);

  const windowedItems = useMemo(() => {
    if (!movies.length) return { start: 0, end: 0, before: 0, after: 0 };

    const totalRows = Math.ceil(movies.length / layout.columns);
    const rowsInView = Math.ceil((viewport.height || window.innerHeight) / Math.max(layout.rowHeight, 1));
    const firstVisibleRow = Math.max(0, Math.floor((viewport.top - layout.top) / Math.max(layout.rowHeight, 1)));
    const startRow = Math.max(0, firstVisibleRow - OVERSCAN_ROWS);
    const endRow = Math.min(totalRows, firstVisibleRow + rowsInView + OVERSCAN_ROWS);
    const start = startRow * layout.columns;
    const end = Math.min(movies.length, endRow * layout.columns);
    const renderedRows = Math.ceil((end - start) / layout.columns);
    const beforeRows = startRow;
    const afterRows = Math.max(0, totalRows - beforeRows - renderedRows);

    return {
      start,
      end,
      before: beforeRows ? Math.max(0, beforeRows * layout.rowHeight - layout.rowGap) : 0,
      after: afterRows ? Math.max(0, afterRows * layout.rowHeight - layout.rowGap) : 0,
    };
  }, [layout, movies, viewport]);

  return (
    <div ref={gridRef} className={`${className} virtualized-grid`}>
      {windowedItems.before > 0 && <div className="virtual-grid-spacer" style={{ height: windowedItems.before }} aria-hidden="true" />}
      {movies.slice(windowedItems.start, windowedItems.end).map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      {windowedItems.after > 0 && <div className="virtual-grid-spacer" style={{ height: windowedItems.after }} aria-hidden="true" />}
    </div>
  );
}

export default VirtualizedMovieGrid;
