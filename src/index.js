import { connect, close } from "./connection.js";

const db = await connect();
const usersCollection = db.collection("users");
const articlesCollection = db.collection("articles");
const studentsCollection = db.collection("students");

const run = async () => {
	try {
		// await getUsersExample();
		// await task1();
		// await task2();
		// await task3();
		// await task4();
		// await task5();
		// await task6();
		// await task7();
		// await task8();
		// await task9();
		// await task10();
		// await task11();
		// await task12();

		await close();
	} catch (err) {
		console.log("Error: ", err);
	}
};
run();

// #### Users
// - Get users example
async function getUsersExample() {
	try {
		const [allUsers, firstUser] = await Promise.all([
			usersCollection.find().toArray(),
			usersCollection.findOne(),
		]);

		console.log("allUsers", allUsers);
		console.log("firstUser", firstUser);
	} catch (err) {
		console.error("getUsersExample", err);
	}
}

// - Get all users, sort them by age (ascending), and return only 5 records with firstName, lastName, and age fields.
async function task1() {
	try {
		const allUsers = await usersCollection
			.find()
			.sort({ age: 1 })
			.limit(5)
			.project({ firstName: 1, lastName: 1, age: 1, _id: 0 })
			.toArray();

		console.log("users (task1) :>>", allUsers);
	} catch (err) {
		console.error("task1", err);
	}
}

// - Add new field 'skills: []" for all users where age >= 25 && age < 30 or tags includes 'Engineering'
async function task2() {
	try {
		const [updatedUsers, allUsers] = await Promise.all([
			usersCollection.updateMany(
				{ $or: [{ age: { $gte: 25, $lt: 30 } }, { tags: "Engineering" }] },
				{ $set: { skills: [] } }
			),
			usersCollection.find().toArray(),
		]);

		console.log("updatedUsers (task2) :>> ", updatedUsers);
		console.log("allUsers (task2) :>> ", allUsers);
	} catch (err) {
		console.error("task2", err);
	}
}

// - Update the first document and return the updated document in one operation (add 'js' and 'git' to the 'skills' array)
//   Filter: the document should contain the 'skills' field
async function task3() {
	try {
		const updatedDocument = await usersCollection.findOneAndUpdate(
			{ skills: { $exists: true } },
			{ $addToSet: { skills: { $each: ["js", "git"] } } },
			{ returnDocument: "after" }
		);

		console.log(updatedDocument.value);
	} catch (err) {
		console.error("task3", err);
	}
}

// - REPLACE the first document where the 'email' field starts with 'john' and the 'address state' is equal to 'CA'
//   Set firstName: "Jason", lastName: "Wood", tags: ['a', 'b', 'c'], department: 'Support'
async function task4() {
	try {
		const replacedUser = await usersCollection.findOneAndReplace(
			{ $and: [{ email: { $regex: /^john/ } }, { "address.state": "CA" }] },
			{
				firstName: "Jason",
				lastName: "Wood",
				tags: ["a", "b", "c"],
				department: "Support",
			},
			{ returnDocument: "after" }
		);

		console.log("replacedUser :>> ", replacedUser.value);
	} catch (err) {
		console.log("task4", err);
	}
}

// - Pull tag 'c' from the first document where firstName: "Jason", lastName: "Wood"
async function task5() {
	try {
		const updatedUser = await usersCollection.findOneAndUpdate(
			{ firstName: "Jason", lastName: "Wood" },
			{ $pull: { tags: "c" } },
			{ returnDocument: "after" }
		);

		console.log("updatedUser (pulled c tag) :>> ", updatedUser.value);
	} catch (err) {
		console.log("task5", err);
	}
}

// - Push tag 'b' to the first document where firstName: "Jason", lastName: "Wood"
//   ONLY if the 'b' value does not exist in the 'tags'
async function task6() {
	try {
		const updatedUser = await usersCollection.findOneAndUpdate(
			{ firstName: "Jason", lastName: "Wood" },
			{ $addToSet: { tags: "b" } },
			{ returnDocument: "after" }
		);

		console.log(
			"updatedUser (pushed b tag, if doesn't exist) :>> ",
			updatedUser.value
		);
	} catch (err) {
		console.log("task6", err);
	}
}

// - Delete all users by department (Support)
async function task7() {
	try {
		const [deleteResult, allUsers] = await Promise.all([
			usersCollection.deleteMany({ department: "Support" }),
			usersCollection.find().toArray(),
		]);

		console.log("deleteResult :>> ", deleteResult);
		console.log("allUsers :>> ", allUsers);
	} catch (err) {
		console.log("task7", err);
	}
}

// #### Articles
// - Create new collection 'articles'. Using bulk write:
//   Create one article per each type (a, b, c)
//   Find articles with type a, and update tag list with next value ['tag1-a', 'tag2-a', 'tag3']
//   Add tags ['tag2', 'tag3', 'super'] to articles except articles with type 'a'
//   Pull ['tag2', 'tag1-a'] from all articles
async function task8() {
	try {
		await articlesCollection.deleteMany({});

		await articlesCollection.bulkWrite([
			{
				insertOne: {
					document: {
						name: "Node.js - introduction",
						description: "Node.js - text",
						type: "a",
					},
				},
			},
			{
				insertOne: {
					document: {
						name: "Mongodb - introduction",
						description: "Mongodb - text",
						type: "b",
					},
				},
			},
			{
				insertOne: {
					document: {
						name: "Angular - introduction",
						description: "Angular - text",
						type: "c",
					},
				},
			},
			{
				updateMany: {
					filter: { type: "a" },
					update: { $set: { tags: ["tag1-a", "tag2-a", "tag3"] } },
				},
			},
			{
				updateMany: {
					filter: { type: { $ne: "a" } },
					update: { $set: { tags: ["tag2", "tag3", "super"] } },
				},
			},
			{
				updateMany: {
					filter: {},
					update: { $pull: { tags: { $in: ["tag1-a", "tag2"] } } },
				},
			},
		]);
		const articles = await articlesCollection.find().toArray();

		console.log("articles :>> ", articles);
	} catch (err) {
		console.error("task8", err);
	}
}

// - Find all articles that contains tags 'super' or 'tag2-a'
async function task9() {
	try {
		const filteredArticles = await articlesCollection
			.find({ tags: { $in: ["super", "tag2-a"] } })
			.toArray();

		console.log("filteredArticles :>> ", filteredArticles);
	} catch (err) {
		console.log("task9", err);
	}
}

// #### Students Statistic (Aggregations)
// - Find the student who have the worst score for homework, the result should be [ { name: <name>, worst_homework_score: <score> } ]
async function task10() {
	try {
		const aggregationResult = await studentsCollection
			.aggregate([
				{ $unwind: "$scores" },
				{ $match: { "scores.type": "homework" } },
				{ $sort: { "scores.score": 1 } },
				{ $limit: 1 },
				{
					$project: { name: 1, worst_homework_score: "$scores.score", _id: 0 },
				},
			])
			.toArray();

		console.log("aggregationResult :>> ", aggregationResult);
	} catch (err) {
		console.log("task10", err);
	}
}

// - Calculate the average score for homework for all students, the result should be [ { avg_score: <number> } ]
async function task11() {
	try {
		const aggregationResult = await studentsCollection
			.aggregate([
				{ $unwind: "$scores" },
				{ $match: { "scores.type": "homework" } },
				{
					$group: { _id: null, avg_score: { $avg: "$scores.score" } },
				},
				{
					$project: { avg_score: 1, _id: 0 },
				},
			])
			.toArray();

		console.log("aggregationResult :>> ", aggregationResult);
	} catch (err) {
		console.log("task11", err);
	}
}

// - Calculate the average score by all types (homework, exam, quiz) for each student, sort from the largest to the smallest value
async function task12() {
	try {
		const aggregationResult = await studentsCollection
			.aggregate([
				{ $unwind: "$scores" },
				{
					$group: { _id: "$name", avg_score: { $avg: "$scores.score" } },
				},
				{
					$sort: { avg_score: -1 },
				},
			])
			.toArray();

		console.log("aggregationResult :>> ", aggregationResult);
	} catch (err) {
		console.log("task12", err);
	}
}
