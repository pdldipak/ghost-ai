# Developmnent Workflow

## Approach
Build this project incrementally using a spec-driven workflow. Context files define what to build, how to build. and what the current state of progress is. Always implement against these specs - donot infer or invent behavior from scratch. 

## Scoping Rules 
- Work on one feature unit or subsystem at a time. 
- Prefer small, verificable increments over large speculative change.
- Do not combine unrelated system boundaries in a single implemented step. 

## When To Split Work 
Split an implementation step if it combines: 
- UI changes and background task changes 
- Real-time canvas state and database persistence 
- Multiple unrelated API routes
- Behavior that is not clearly defined in the context files. 
If a change cannot be verified end to end quickly, the scope is too broad - split it. 

## Handeling Missing Requirements
