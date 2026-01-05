import React from 'react';

const SearchBar = ({ query, setQuery, handleSearch, suggestions, handleSelect }) => {
  return (
    <div className="search-container">
      <input 
        type="text" 
        className="search-input" 
        placeholder="🔎 Search condition (e.g., Amavata, Fever)..."
        value={query}
        onChange={handleSearch}
      />
      
      {suggestions.length > 0 && (
        <div className="suggestions-box">
          {suggestions.map((item) => (
            <div 
              key={item._id} 
              className="suggestion-item"
              onClick={() => handleSelect(item)}
            >
              <strong>{item.diseaseName}</strong> 
              <span style={{color: '#9ca3af', fontSize: '0.9rem'}}> • {item.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;