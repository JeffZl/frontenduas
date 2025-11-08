interface searchProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchComponent = ({ searchQuery, setSearchQuery }: searchProps) => {
    return (
        <div className="mb-3">
            <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or handle..."
            className="w-full bg-gray-100 dark:bg-[#202327] text-black dark:text-white px-4 py-2 rounded-full outline-none placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            autoFocus
            />
        </div>
    )
}

export default SearchComponent