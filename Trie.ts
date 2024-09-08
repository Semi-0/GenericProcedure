//TODO: NOT WORKING YET

export class Trie {
    private value: any;
    private edgeAlist: [((x: any) => boolean), Trie][];
  
    constructor() {
      this.value = null;
      this.edgeAlist = [];
    }
  
    hasValue(): boolean {
      return this.value !== null;
    }
  
    getValue(): any {
      if (this.value === null) {
        throw new Error("Trie node has no value");
      }
      return this.value;
    }
  
    setValue(value: any): void {
      this.value = value;
    }
  
    internPath(path: ((x: any) => boolean)[]): Trie {
      let currentTrie: Trie = this;
      for (const predicate of path) {
        currentTrie = currentTrie.addEdge(predicate);
      }
      return currentTrie;
    }
  
    addEdge(predicate: (x: any) => boolean): Trie {
      const existingEdge = this.edgeAlist.find(([p]) => p === predicate);
      if (existingEdge) {
        return existingEdge[1];
      }
      const successor = new Trie();
      this.edgeAlist.push([predicate, successor]);
      return successor;
    }
  
    setPathValue(path: ((x: any) => boolean)[], value: any): void {
      this.internPath(path).setValue(value);
    }
  
    getMatchingTries(features: any[]): Trie[] {
      let tries: Trie[] = [this];
      for (const feature of features) {
        tries = tries.flatMap(trie => trie.findAllEdges(feature));
      }
      return tries;
    }
  
    getAllValues(features: any[]): any[] {
      return this.getMatchingTries(features)
        .filter(trie => trie.hasValue())
        .map(trie => trie.getValue());
    }
  
    getAValue(features: any[]): any {
      return this.getAValueBySearching(features);
    }
  
    private getAValueBySearching(features: any[]): any {
      // TODO: this is wrong
      const search = (trie: Trie, features: any[], succeed: (value: any, fail: () => any) => any, fail: () => any): any => {
        if (features.length > 0) {
          return this.tryEdges(trie.edgeAlist, features[0],
            (trie, fail) => search(trie, features.slice(1), succeed, fail),
            fail);
        } else if (trie.hasValue()) {
          return succeed(trie.getValue(), fail);
        } else {
          return fail();
        }
      };
  
      return search(this, features,
        (value) => value,
        () => { throw new Error("Unable to match features: " + features); }
      );
    }
  
    private findAllEdges(feature: any): Trie[] {
      return this.edgeAlist
        .filter(([predicate]) => this.applyPredicate(predicate, feature))
        .map(([, trie]) => trie);
    }
  
    private tryEdges(edges: [((x: any) => boolean), Trie][], feature: any, succeed: (trie: Trie, fail: () => any) => any, fail: () => any): any {
      if (edges.length > 0) {
        return this.tryEdge(edges[0], feature, succeed,
          () => this.tryEdges(edges.slice(1), feature, succeed, fail));
      } else {
        return fail();
      }
    }
  
    private tryEdge(edge: [((x: any) => boolean), Trie], feature: any, succeed: (trie: Trie, fail: () => any) => any, fail: () => any): any {
      if (this.applyPredicate(edge[0], feature)) {
        return succeed(edge[1], fail);
      } else {
        return fail();
      }
    }
  
    private applyPredicate(predicate: (x: any) => boolean, feature: any): boolean {
      // In a real implementation, you might want to add predicate counting here
      return predicate(feature);
    }
  
    getEntries(): { [key: string]: any } {
      return Object.fromEntries(
        this.edgeAlist.map(([predicate, trie]) => [
          this.getPredicateName(predicate),
          trie.getEntries()
        ])
      );
    }
  
    private getPredicateName(predicate: (x: any) => boolean): string {
      return predicate.name || "anonymous";
    }
  }
  
