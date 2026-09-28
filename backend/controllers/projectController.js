import mongoose, { mongo } from "mongoose";
import { Project } from "../models/Project.js";
import { enhancePrompt, generateSite, postProcess } from "../utils/services.js";
import { generateMockSite } from "../utils/mockGenerator.js";

// to check a string is  valid MongoDB id
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
};

// to load own projects
export async function loadOwnedProject(req, res) {
  if(!isValidId(req.params.id)) {
    res.status(400).json({ error: "Invalid id" });
    return null;
  }

  const project = await Project.findById(req.params.id);
  if(!project){
    res.status(404).json({ error: "Project not found" });
    return null;
  }
  if(project.user.toString() !== req.user._id.toString()) {
    res.status(403).json({ error: "Forbiden" });
    return null;
  }
  return project;
}

// to get the list of projects of the user
export async function list(req, res, next) {
  try {
    const list = await Project.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(100)
    .select("-editorContent -messages -enhancedPrompt");
    res.json({ projects: list.map((p)=> p.toClient()) });
  } 
  
  catch (err) {
    next(err)
  }
}

// to create a new project
export async function create(req, res, next) {
  try {
    const prompt = (req.body.prompt || "").trim();
    const name = (req.body.name || "").trim();
    const visualEditor = !!req.body.visualEditor;

    // Allow creation without a prompt if opening directly in visual editor
    if (!visualEditor) {
      if (!prompt) return res.status(400).json({ error: "Prompt is required." });
      if (prompt.length > 2000)
        return res.status(400).json({ error: "Prompt is too long (max 2000 characters)." });
    }

    const project = await Project.create({
      user: req.user._id,
      name: name || (prompt ? prompt.split(/[.!?]/)[0].slice(0, 60) : "Untitled Project"),
      prompt: prompt || "",
      messages: prompt ? [{ role: "user", text: prompt }] : [],
    });

    res.status(201).json({ project: project.toClient() });
  }
  catch (err) {
    next(err);
  }
}

// return a single project user owns
export async function get(req, res, next) {
  try {
    const project = await loadOwnedProject(req, res);
    if(!project) return;
    res.json({ project: project.toClient() });
  } 
  
  catch (err) {
    next(err);
  }
}

// to update a project
export async function update(req, res, next) {
  try {
    const project = await loadOwnedProject(req, res);
    if(!project) return;

    if(req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if(!name || name.length > 80)
        return res.status(400).json({ error: "Name must be 1-80 characters." });
      project.name = name;
    }

    if(req.body.html !== undefined) {
      const html = String(req.body.html);
      if(html.length > 2_000_000)
        return res.status(400).json({ error: "HTML is too long." });
      project.html = html;
    }

     if(req.body.editorContent !== undefined) {
      project.editorContent = String(req.body.editorContent); // for editor content
    }

    if(req.body.published !== undefined) {
      const published = Boolean(req.body.published);
      project.published = published;
      project.publishedAt = published ? new Date() : null;
    }
    await project.save();
    res.json({ project: project.toClient() });
  } 
  catch (err) {
    next(err);
  }
}

// to delete user's project
export async function remove(req, res, next) {
  try {
    const project = await loadOwnedProject(req, res);
    if(!project) return;
    await project.deleteOne();

    res.json({ ok: true });
  } 
  catch (err) {
    next(err);
  }
}

// to collapse whitespace for html script
function visibleText(html) {
  if(!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// to build and edit the html of the site and charge credits

export async function generate(req, res, next) {
  try {
    const project = await loadOwnedProject(req, res);
    if (!project) return;

    const isFirstGeneration = !project.html || project.html.length < 100;
    const cost = isFirstGeneration ? 5 : 2;
    if ((req.user.credits ?? 0) < cost)
      return res.status(402).json({
        error: `You need at least ${cost} credit${cost === 1 ? "" : "s"} ${isFirstGeneration ? "for a new site" : "for changes"}. Top up to continue.`,
        cost,
      });
    const prompt = (req.body.prompt || "").trim();
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });
    if (prompt.length > 2000)
      return res
        .status(400)
        .json({ error: "Prompt is too long (max 2000 characters)." });

    const last = project.messages[project.messages.length - 1];
    if (!last || last.role !== "user" || last.text !== prompt) {
      project.messages.push({ role: "user", text: prompt });
    }

    const originalPrompt = project.prompt || prompt;
    // original prompt shown after output

    let brief;
    if (isFirstGeneration) {
      const enhanceResult = await enhancePrompt(prompt);
      project.enhancedPrompt = enhanceResult.text;
      brief = enhanceResult.text;
    } else {
      brief = prompt;
    }

    const genResult = await generateSite(brief, {
      previousHtml: project.html,
      history: project.messages,
      originalPrompt,
    });


    const isRealLlm = genResult.source === "llm";
    const tooShort = !genResult.html || genResult.html.length < 500;
    const visibleLen = visibleText(genResult.html).length;
    const hasAnyHeading = /<h[1-3]\b/i.test(genResult.html || "");
    const sectionCount = (genResult.html?.match(/<section\b/gi) || []).length;
    const badOutput =
      tooShort || visibleLen < 200 || (!hasAnyHeading && sectionCount < 1);
    const truncated = Boolean(genResult.truncated);
    const hadWorkingSite = Boolean(project.html && project.html.length > 200);


    let outcome;
    if (hadWorkingSite && (!isRealLlm || badOutput || truncated)) {

      outcome = "keptPrevious";
    } else if (!isRealLlm || badOutput) {
      project.html = isRealLlm
        ? postProcess(generateMockSite(originalPrompt))
        : genResult.html;
      outcome = "template";
    } else if (truncated) {
      project.html = genResult.html;
      outcome = "incomplete";
    } else {
      project.html = genResult.html;
      outcome = "saved";
    }
    if (outcome !== "saved")
      console.warn(
        `[generate] outcome=${outcome} source=${genResult.source} htmlLen=${genResult.html?.length || 0}`,
      );

    let assistantText;
    if (outcome === "saved") {
      assistantText =
        genResult.summary && genResult.summary.length > 20
          ? genResult.summary
          : "Done — I built your site.";
    } else if (outcome === "keptPrevious") {
      assistantText =
        "That update came back incomplete, so I kept your current site unchanged — please try again in a moment.";
    } else if (outcome === "incomplete") {
      assistantText =
        "Your site is ready, but it came out a little cut off — try again and I'll complete it.";
    } else if (genResult.source === "mock-no-key") {
      assistantText =
        "No AI provider is configured on the server, so I used a starter template.";
    } else {
      assistantText =
        "The AI was busy just now, so I used a starter template — please try again in a moment.";
    }

    project.messages.push({ role: "assistant", text: assistantText });
    if (!project.prompt) project.prompt = prompt;
    await project.save();

    if (outcome === "saved") {
      req.user.credits = Math.max(0, req.user.credits - cost);
      await req.user.save();
    }

    res.json({ project: project.toClient(), user: req.user.toClient() });
    // it will generate the site and save the site for that user
    // also if it is save we can update
    // if kept previous then we can update that too by given prompt
  } catch (err) {
    next(err);
  }
}

export async function fetchUrl(req, res, next) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required.' });
    }

    // Basic URL validation
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Only http and https URLs are supported.' });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return res.status(415).json({ error: 'URL does not return HTML content.' });
    }

    let html = await response.text();

    // Rewrite relative URLs to absolute so assets load correctly in the iframe
    const base = `${parsedUrl.protocol}//${parsedUrl.host}`;
    html = html
      .replace(/src="(?!http|\/\/|data:)([^"]+)"/g, `src="${base}/$1"`)
      .replace(/href="(?!http|\/\/|#|mailto:)([^"]+)"/g, `href="${base}/$1"`)
      .replace(/url\((?!['"]?(?:http|\/\/|data:))['"]?([^'")]+)['"]?\)/g, `url(${base}/$1)`);

    res.json({ html, sourceUrl: parsedUrl.toString() });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Request timed out. The URL took too long to respond.' });
    }
    next(err);
  }
}