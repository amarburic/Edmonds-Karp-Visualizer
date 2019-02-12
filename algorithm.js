var Algorithm = (function(){
    const matrix = (rows, cols, def) => new Array(cols).fill(def).map((o, i) => new Array(rows).fill(def))
    
    var nodes = 2;
    var edges = [];
    var history = [];
    var flow = 0; 
    var finished = false;

    /* PRIVATE */
    
    var resetFlow = function() {
        edges.forEach(edge => edge.flow = 0);
        flow = 0; 
    }

    var findAugmentingPath = function() {
        steps = [];
        queue = [];
        source = 0; 
        sink = nodes - 1;
        queue.push(source);
        predecessor = new Array(nodes).fill(null);
        while(queue.length > 0) {
            current = queue[0];
            queue.splice(0, 1);
            steps.push({"currentNode": current, "testedEdges": []});
            for(var edge of edges.filter(edge => (edge.source == current || edge.sink == current) && (predecessor[current] == null || edge != predecessor[current].edge))) {
                var reverse = edge.sink == current;
                var discoveredNode = reverse ? edge.source : edge.sink  
                if(predecessor[discoveredNode] == null && discoveredNode != source && (!reverse && edge.capacity > edge.flow || reverse && edge.flow > 0)) {
                    predecessor[discoveredNode] = {edge: edge, reverse: reverse};
                    steps[steps.length - 1].tests.push({"source": edge.source, "sink": edge.sink, "accepted": true, "reverse": reverse});
                    if(edge.sink == sink) {
                        queue = [];
                        break;
                    } else 
                        queue.push(discoveredNode);

                } else 
                    steps[steps.length - 1].tests.push({"source": edge.source, "sink": edge.sink, "accepted": false, "reverse": reverse});
            }
        }
        augmentingPath = [];
        if(predecessor[sink] != null) {
            node = sink;
            while(predecessor[node] != null) {
                augmentingPath.splice(0, 0, predecessor[node]);
                node = predecessor[node].reverse ? predecessor[node].edge.sink : predecessor[node].edge.source;
            }
        }   
        return {"path": augmentingPath, "steps": steps}; 
    }

    var findDelta = function(augmentingPath) {
        var steps = [];
        delta = Number.MAX_SAFE_INTEGER;
        for(var step of augmentingPath) {
             delta = Math.min(delta, step.reverse ? step.edge.flow : (step.edge.capacity - step.edge.flow));
             steps.push({"source": step.edge.source, "sink": step.edge.sink, "delta": delta, "reverse": step.reverse});
        }
        return {"value": delta, "steps": steps};
    }
    
    /* PUBLIC */

    /* Sets the number of nodes. Resets the algorithm */
    var setNodes = function(_nodes) {
        if(_nodes < 2)
            throw "Illegal number of nodes";
        nodes = _nodes;
        edges = [];
        history = [];
        finished = false;
        resetFlow();
    }
    
    /* Sets a specific edge. Resets the algorithm */
    var setEdge = function(source, sink, capacity) {
        if(source < 0 || source >= nodes)
            throw "Illegal source node";
        if(sink < 0 || sink >= nodes)
            throw "Illegal sink node";
        if(capacity < 0)
            throw "Illegal capacity value";
        removeEdge(source, sink);
        edges.push({"source": source, "sink": sink, "capacity": capacity, "flow": 0});
    }

    /* Removes a specific edge. Resets the algorithm */
    var removeEdge = function(source, sink) {
        edges = edges.filter(edge => !(edge.source == source && edge.sink == sink));
        history = [];
        finished = false;
        resetFlow();
    }

    /* Sets the graph with a capacity matrix */
    var setGraph = function(graph) {
        if(graph.length != graph[0].length) 
            throw "Matrix must be square"
        history = [];
        edges = [];
        finished = false;
        setNodes(graph.length);
        for(var row in graph)
            for(var col in graph[row])
                if(row != col && graph[row][col] > 0)
                    setEdge(row, col, graph[row][col]);
    }

    /* Returns the capacity matrix*/
    var getGraph = function() {
        var graph = matrix(nodes, nodes, 0);
        edges.forEach(edge => graph[edge.source][edge.sink] = edge.capacity);
        return graph;
    }

    /* Returns a capacity/flow matrix   */
    var getGraphWithFlow = function() {
        var graph = matrix(nodes, nodes, null);
        edges.forEach(edge => graph[edge.source][edge.sink] = {"capacity": edge.capacity, "flow": edge.flow});
        return graph;
    }

    /* Gets current flow */
    var getFlow = function() {
        return flow; 
    }

    var isFinished = function() {
        return finished;
    }

    var hasPrevious = function() {
        return history.length > 0;
    }

    /* Performs the next step of the algorithm. Changes the state of the graph. Returns two attributes: 
       bfsSteps - steps taken during the bfs phase (see findAugmentingPath)
       deltaSteps - value of delta after analyzing each of the edges in the augmenting path; is null on the last step (see findDelta)
    */ 
    var nextStep = function() {
        if(finished)
            throw "Algorithm has terminated";
        augmentingPath = findAugmentingPath();
        if(augmentingPath.path.length == 0) {
            finished = true;
            return {bfsSteps: augmentingPath.steps, deltaSteps: null};
        }
        history.push({"edges": JSON.parse(JSON.stringify(edges)), "flow": flow})
        delta = findDelta(augmentingPath.path);
        for(var step of augmentingPath.path) {
            step.edge.flow = step.edge.flow + (step.reverse ? -1 : 1) * delta.value;  
        }
        flow = flow + delta.value; 
        return {bfsSteps: augmentingPath.steps, deltaSteps: delta.steps};
    }

    /* Undo of the last step. */ 
    var previousStep = function() {
        numberOfSteps = history.length; 
        if(numberOfSteps == 0)
            return;
        lastStep = history[numberOfSteps - 1]; 
        edges = JSON.parse(JSON.stringify(lastStep.edges));
        flow = lastStep.flow;
        finished = false; 
        history.splice(numberOfSteps - 1, 1);
    }

    return {
        setNodes: setNodes,
        setEdge: setEdge,
        removeEdge: removeEdge,
        getGraph: getGraph,
        getGraphWithFlow: getGraphWithFlow,
        setGraph: setGraph,
        getFlow: getFlow,
        isFinished: isFinished,
        hasPrevious: hasPrevious, 
        nextStep: nextStep,
        previousStep: previousStep
    }
}());

/* Juricev prvi primjer sa prilozene prezentacije */
Algorithm.setNodes(8);
Algorithm.setEdge(0, 1, 8);
Algorithm.setEdge(1, 2, 3);
Algorithm.setEdge(1, 4, 3);
Algorithm.setEdge(2, 3, 4);
Algorithm.setEdge(3, 1, 3);
Algorithm.setEdge(3, 4, 1);
Algorithm.setEdge(3, 5, 2);
Algorithm.setEdge(4, 5, 2);
Algorithm.setEdge(4, 6, 6);
Algorithm.setEdge(5, 2, 1);
Algorithm.setEdge(5, 7, 1);
Algorithm.setEdge(6, 7, 9);
var iteration = 1; 
while(!Algorithm.isFinished()) {
    console.log("Iteration: " + iteration++);
    step = Algorithm.nextStep();
    console.log("BFS: ")
    console.log(JSON.stringify(step.bfsSteps, null, 2));
    console.log("Delta: ")
    console.log(JSON.stringify(step.deltaSteps, null, 4));
    console.log("Graph: ")
    console.log(JSON.stringify(Algorithm.getGraphWithFlow(), null, 4));
}
console.log(Algorithm.getFlow());
iteration--;
while(Algorithm.hasPrevious()) {
    console.log("Iteration: " + --iteration);
    Algorithm.previousStep();
    console.log("Graph: ")
    console.log(JSON.stringify(Algorithm.getGraphWithFlow(), null, 4));
}