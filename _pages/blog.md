---
layout: page
title: Blog
permalink: /blog/
description: Articles on machine learning, AI systems, and engineering.
nav: true
nav_order: 4
pagination:
  enabled: true
---

<div class="post">
  <ul class="post-list">
    {% if page.pagination.enabled %}
      {% assign postlist = paginator.posts %}
    {% else %}
      {% assign postlist = site.posts %}
    {% endif %}

    {% for post in postlist %}
    <li>
      <h3>
        {% if post.redirect contains '://' %}
          <a class="post-title" href="{{ post.redirect }}" target="_blank">{{ post.title }}</a>
        {% elsif post.external_source %}
          <a class="post-title" href="{{ post.feed_url }}" target="_blank">{{ post.title }}</a>
        {% elsif post.redirect == blank %}
          <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        {% else %}
          <a class="post-title" href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
        {% endif %}
      </h3>
      {% if post.description %}
        <p>{{ post.description }}</p>
      {% endif %}
      <p class="post-meta">
        {{ post.date | date: '%B %d, %Y' }}
        {% if post.external_source %}
          &nbsp;&middot;&nbsp;
          <a href="{{ post.feed_url }}" target="_blank">{{ post.external_source }}</a>
        {% endif %}
      </p>
    </li>
    {% endfor %}
  </ul>

  {% if page.pagination.enabled %}
    {% if paginator.total_pages > 1 %}
      {% include pagination.liquid %}
    {% endif %}
  {% endif %}
</div>
