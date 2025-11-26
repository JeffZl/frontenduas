import styles from "./SearchComponent.module.css";

interface searchProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchComponent = ({ searchQuery, setSearchQuery }: searchProps) => {
    return (
        <div className={styles.wrapper}>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or handle..."
                className={styles.input}
                autoFocus
            />
        </div>
    );
};

export default SearchComponent;
