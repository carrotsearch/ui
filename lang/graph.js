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

  this.visitDepthFirst = (start, cb, visited = new Set(), payload, from) => {
    if (visited.has(start)) {
      return;
    }
    checkNodeExists(start);

    if (cb(start, payload, from) !== false) {
      visited.add(start);
      edgesFromNode.get(start).forEach(({ to, payload }) => {
        this.visitDepthFirst(to, cb, visited, payload, start);
      });
    }
  };

  this.isEmpty = () => {
    return edgesFromNode.size === 0;
  };
}
