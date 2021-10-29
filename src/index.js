/**
 * Basic version of https://developer.okta.com/blog/2019/05/29/build-crud-nodejs-graphql
 * without authentication and with renamed fields
 */
import { ApolloServer, gql } from 'apollo-server';
import { v4 } from 'uuid';

const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type DeleteResponse {
    ok: Boolean!
  }

  type Query {
    todos: [Todo]
  }

  type Mutation {
    addTodo(title: String!, completed: Boolean!): Todo
    editTodo(id: ID!, title: String, completed: Boolean): Todo
    deleteTodo(id: ID!): DeleteResponse
  }
`;

const todos = {};
const addTodo = todo => {
  const id = v4();
  return todos[id] = { ...todo, id };
};

// Start with a few initial todos
addTodo({ title: "Eat", completed: false });
addTodo({ title: "Code", completed: false });
addTodo({ title: "Sleep", completed: false });

const resolvers = {
  Query: {
    todos: () => Object.values(todos),
  },
  Mutation: {
    addTodo: async (parent, todo) => {
      return addTodo(todo);
    },
    editTodo: async (parent, { id, ...todo }) => {
      if (!todos[id]) {
        throw new Error("Quote doesn't exist");
      }

      todos[id] = {
        ...todos[id],
        ...todo,
      };

      return todos[id];
    },
    deleteTodo: async (parent, { id }) => {
      const ok = Boolean(todos[id]);
      delete todos[id];

      return { ok };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`); // eslint-disable-line no-console
});