/*https://reactflow.dev/docs/examples/edges/edge-types/*/
import React, { useEffect, useState } from "react";
import dagre from "dagre";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  MarkerType,
} from "react-flow-renderer";

import CustomEdge from "../component/CustomEdge";

import myData from "../public/typeform_data.json";

const edgeTypes = {
  custom: CustomEdge,
};

const EdgesFlow = () => {
  // Create a new directed graph
  var g = new dagre.graphlib.Graph();
  g.setGraph({});
  g.setDefaultEdgeLabel(function () {
    return {};
  });

  const myNodes = [];
  const myEdges = [];
  if (myNodes.length == 0 && myEdges.length == 0) {
    const dataPage = [];

    //페이지 구분으로 1차 파싱
    myData?.body.forEach((e, index) => {
      //tmp페이지
      const _page = {
        label: "",
        action: "",
        child: [],
      };
      if (index == 0) {
        _page.type = "input";
      }

      //필요한 자료 모으기
      e.body.forEach((component) => {
        //첫페이지 타이틀
        if (component.description == "Title") {
          _page.label = component.form.text;
        }

        //이외의 페이지 타이틀
        if (component.description == "Question Title") {
          _page.label += " " + component.form.text;
        }

        //첫 페이지 버튼
        if (component.description == "Normal Button") {
          if (component.form?.action_info?.page_index) {
            _page.child.push({
              label: component.form?.text,
              moveIndex: component.form?.action_info?.page_index,
            });
            //_page.moveIndex = component.form?.action_info?.page_index;
          }
        }

        //선택지 버튼
        if (component.description == "Single Choice") {
          component.form.choice_list.forEach((c, c_index) => {
            _page.child.push({
              // label: c.text, //라벨이 너무길어~
              label: "P" + index + "-A" + c_index,
              moveIndex: c.action_info?.page_index,
            });
          });
        }

        //종결짓는 버튼
        if (component.description == "Two Buttons") {
          component.form.button_list.forEach((c) => {
            if (c.action_info?.page_index) {
              if (c.text == "다시하기" || c.text == "처음으로") {
                _page.child.push({
                  label: c.text,
                  moveIndex: c.action_info?.page_index,
                  action: "restart",
                });
              }
            }
          });
        }
      });
      dataPage.push(_page);
    });

    // 노드 만들기
    dataPage.forEach((data, page) => {
      const node = {
        id: "node-" + page,
        type: "input",
        data: { label: "[page:" + page + "]" + data.label },
        position: { x: 0, y: 0 },
        // sourcePosition: "right",
        // targetPosition: "left",
      };

      if (page != 0) delete node.type;
      myNodes.push(node);

      // 좌표를 위한 노드추가
      g.setNode(node.id, { label: node.data.label, width: 144, height: 100 });
    });

    // 엣지 만들기 ( 이음선 )
    dataPage.forEach((data, index) => {
      if (data.moveIndex) {
        const edge = {
          id: "edges-" + index + "-to-" + data.moveIndex,
          source: "node-" + index,
          target: "node-" + data.moveIndex,
          label: data.label,
          // type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        };
        myEdges.push(edge);
        g.setEdge(edge.source, edge.target);
      }
      if (data.child?.length > 0) {
        data.child.forEach((n, i) => {
          const edge = {
            id: "edges-" + index + "-to-" + n.moveIndex,
            source: "node-" + index,
            target: "node-" + n.moveIndex,
            label: n.label,
            // type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
          if (n.action == "restart") {
            edge.animated = true;
            edge.style = { stroke: "red" };
          }
          myEdges.push(edge);
          g.setEdge(edge.source, edge.target);
        });
      }
    });

    //포지션 계산
    //포지션 입력
    dagre.layout(g);
    g.nodes().forEach(function (v, i) {
      // console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
      myNodes[i].position = {
        x: g.node(v).x,
        y: g.node(v).y,
      };
    });
    // g.edges().forEach(function (e) {
    //   console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
    // });
  }

  // console.log("@@@@", myNodes);
  // console.log("@@@@", myEdges);

  const [nodes, , onNodesChange] = useNodesState(myNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(myEdges);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  return (
    <>
      <div style={{ height: 950 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          snapToGrid={true}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </>
  );
};

export default EdgesFlow;
