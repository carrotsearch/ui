export function Graph() {
  const edgesFromNode = new Map();

  const checkNodeExists = (n, name) => {
    if (!edgesFromNode.has(n)) {
      throw Error(`<${name}> node does not exist.`);
    }
  };

  this.addNode = n => {
    if (edgesFromNode.has(n)) {
      throw Error(`Node ${JSON.stringify(n)} already exists.`);
    }
    return edgesFromNode.set(n, new Set());
  };

  this.addEdge = (from, to, payload) => {
    checkNodeExists(from, "from");
    checkNodeExists(to, "to");
    edgesFromNode.get(from).add({ to: to, payload: payload });
  };

  this.visitDepthFirst = (from, cb, visited = new Set()) => {
    if (visited.has(from)) {
      return;
    }
    checkNodeExists(from);

    cb(from);
    visited.add(from);
    edgesFromNode.get(from).forEach(({ to, payload }) => {
      this.visitDepthFirst(to, cb, visited);
    });
  };

  this.isEmpty = () => {
    return edgesFromNode.size === 0;
  };
}
