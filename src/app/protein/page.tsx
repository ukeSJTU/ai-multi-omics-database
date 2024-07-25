const DefaultRightPanel = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Welcome to the Protein Explorer
      </h2>
      <p className="mb-4">
        This website allows you to explore and analyze protein structures and
        relationships. Here's how to use it:
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li>
          Use the search panel on the left to find proteins by name, ID, or
          keywords.
        </li>
        <li>
          Click on a protein in the search results to view its details in this
          panel.
        </li>
        <li>
          Explore the protein's structure, sequence, and related information.
        </li>
        <li>
          Use the relationship graph to discover connections between proteins.
        </li>
        <li>
          Adjust visualization settings to customize your view of the protein
          structures.
        </li>
      </ol>
      <p className="mt-4">
        Get started by searching for a protein in the left panel!
      </p>
    </div>
  );
};

export default DefaultRightPanel;
