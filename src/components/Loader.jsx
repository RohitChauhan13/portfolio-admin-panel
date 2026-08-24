import './Loader.css';

/**
 * PageLoader — full-page / section blocking loader
 * Used when an entire page is fetching before it can render.
 * @param {string} [text] — optional label below the animation
 */
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="pgloader">
    <div className="pgloader__mark">
      <span /><span /><span />
    </div>
    {text && <p className="pgloader__text">{text}</p>}
  </div>
);

/**
 * InlineLoader — compact spinner for cards / stats / inline contexts
 * @param {string} [text]
 * @param {string} [size] — 'sm' | 'md' (default 'md')
 */
export const InlineLoader = ({ text, size = 'md' }) => (
  <div className={`inloader inloader--${size}`}>
    <svg className="inloader__ring" viewBox="0 0 36 36" aria-hidden="true">
      <circle className="inloader__track" cx="18" cy="18" r="15" />
      <circle className="inloader__fill"  cx="18" cy="18" r="15" />
    </svg>
    {text && <span className="inloader__text">{text}</span>}
  </div>
);

/**
 * TableSkeletonRows — skeleton placeholder rows for DataTable
 * @param {number} cols  — number of columns (including Actions col)
 * @param {number} [rows] — number of skeleton rows (default 5)
 */
export const TableSkeletonRows = ({ cols, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, ri) => (
      <tr key={ri} className="skel-row">
        {Array.from({ length: cols }).map((_, ci) => (
          <td key={ci}>
            <span
              className="skel-cell"
              style={{ width: ci === 0 ? '60%' : ci === cols - 1 ? '52px' : `${50 + ((ci * 17) % 35)}%` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/**
 * ModalLoader — centered spinner for modals (e.g. chat history)
 */
export const ModalLoader = ({ text = 'Loading...' }) => (
  <div className="modalloader">
    <InlineLoader size="md" />
    <p className="modalloader__text">{text}</p>
  </div>
);
